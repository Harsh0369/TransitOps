import { PrismaClient, VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus, Role, UserStatus, ComplianceType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting extensive seeder...');

  // 1. Clean Database
  console.log('Cleaning database...');
  const models = ['auditLog', 'expense', 'fuelLog', 'tripStatusHistory', 'vehicleStatusHistory', 'vehicleCompliance', 'maintenance', 'trip', 'driver', 'vehicle', 'user'];
  for (const model of models) {
    await (prisma as any)[model].deleteMany();
  }

  // 2. Hash Password
  const hashedPassword = await bcrypt.hash('Password123', 10);

  // 3. Seed Users & Drivers
  console.log('Seeding Users and Drivers...');
  const fm = await prisma.user.create({ data: { name: 'Fleet Manager', email: 'fleet@demo.com', password: hashedPassword, role: 'FLEET_MANAGER' } });
  const so = await prisma.user.create({ data: { name: 'Safety Officer', email: 'safety@demo.com', password: hashedPassword, role: 'SAFETY_OFFICER' } });
  const fa = await prisma.user.create({ data: { name: 'Financial Analyst', email: 'finance@demo.com', password: hashedPassword, role: 'FINANCIAL_ANALYST' } });
  
  const drivers = [];

  // 3.5 Demo Driver
  const driverUser = await prisma.user.create({ data: { name: 'Demo Driver', email: 'driver@demo.com', password: hashedPassword, role: 'DRIVER', phoneNumber: '9999999999' } });
  const demoDriver = await prisma.driver.create({
      data: {
        userId: driverUser.id,
        name: driverUser.name,
        licenseNumber: 'DEMO-LIC-123',
        licenseCategory: 'HEAVY',
        licenseExpiry: faker.date.future({ years: 3 }),
        contactNumber: '9999999999',
        status: 'AVAILABLE',
        safetyScore: 100
      }
  });
  drivers.push(demoDriver);

  for (let i = 0; i < 75; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phoneNumber: faker.phone.number(),
        password: hashedPassword,
        role: 'DRIVER'
      }
    });

    const isSuspended = i % 15 === 0;
    const licenseExpiry = isSuspended ? faker.date.past({ years: 1 }) : faker.date.future({ years: 3 });
    const status = isSuspended ? 'SUSPENDED' : faker.helpers.arrayElement(['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'ON_TRIP', 'OFF_DUTY'] as DriverStatus[]);
    
    const driver = await prisma.driver.create({
      data: {
        userId: user.id,
        name: user.name,
        licenseNumber: faker.vehicle.vrm(),
        licenseCategory: faker.helpers.arrayElement(['HEAVY', 'LIGHT', 'HAZMAT']),
        licenseExpiry,
        contactNumber: user.phoneNumber || faker.phone.number(),
        status,
        safetyScore: faker.number.int({ min: 40, max: 100 })
      }
    });
    drivers.push(driver);
  }

  // 4. Seed Vehicles & Compliances
  console.log('Seeding Vehicles and Compliances...');
  const vehicles = [];
  for (let i = 0; i < 100; i++) {
    const status = faker.helpers.arrayElement(['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'ON_TRIP', 'ON_TRIP', 'IN_SHOP', 'RETIRED'] as VehicleStatus[]);
    const isCostly = i === 10;
    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNumber: faker.vehicle.vrm(),
        name: faker.vehicle.vehicle(),
        model: String(faker.date.past({ years: 10 }).getFullYear()),
        type: faker.helpers.arrayElement(['HEAVY_TRUCK', 'LIGHT_TRUCK', 'VAN', 'REFRIGERATED']),
        capacity: faker.number.int({ min: 2000, max: 30000 }),
        odometer: faker.number.int({ min: 10000, max: 500000 }),
        acquisitionCost: faker.number.int({ min: 30000, max: 200000 }),
        status
      }
    });
    vehicles.push(vehicle);

    // Audit and Vehicle Status History
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'VEHICLE',
        entityId: vehicle.id,
        userId: fm.id,
        metadata: { source: 'seed' }
      }
    });

    if (status !== 'AVAILABLE') {
       await prisma.vehicleStatusHistory.create({
         data: {
           vehicleId: vehicle.id,
           oldStatus: 'AVAILABLE',
           newStatus: status,
           changedBy: fm.id,
           remarks: 'Status updated by seeder',
           changedAt: faker.date.recent({ days: 30 })
         }
       });
       await prisma.auditLog.create({
        data: {
          action: 'UPDATE_STATUS',
          entity: 'VEHICLE',
          entityId: vehicle.id,
          userId: fm.id,
          oldValue: { status: 'AVAILABLE' },
          newValue: { status },
          metadata: { source: 'seed' }
        }
      });
    }

    // Add compliances if not retired
    if (status !== 'RETIRED') {
      const isExpired = i % 12 === 0; // Some expired compliances for Ops Center
      const isExpiringSoon = i % 15 === 0; // Some expiring < 30 days
      
      let expiryDate;
      if (isExpired) {
        expiryDate = faker.date.recent({ days: 10 });
      } else if (isExpiringSoon) {
        expiryDate = faker.date.soon({ days: 15 });
      } else {
        expiryDate = faker.date.future({ years: 1 });
      }

      await prisma.vehicleCompliance.create({
        data: {
          vehicleId: vehicle.id,
          type: 'INSURANCE',
          certificateNumber: faker.string.alphanumeric(10),
          issueDate: faker.date.past({ years: 1 }),
          expiryDate
        }
      });
      await prisma.vehicleCompliance.create({
        data: {
          vehicleId: vehicle.id,
          type: 'REGISTRATION',
          certificateNumber: faker.string.alphanumeric(10),
          issueDate: faker.date.past({ years: 1 }),
          expiryDate: faker.date.future({ years: 2 })
        }
      });
      await prisma.vehicleCompliance.create({
        data: {
          vehicleId: vehicle.id,
          type: 'FITNESS',
          certificateNumber: faker.string.alphanumeric(10),
          issueDate: faker.date.past({ years: 1 }),
          expiryDate: faker.date.future({ years: 1 })
        }
      });
    }
  }

  // 5. Seed Trips
  console.log('Seeding Trips, Logs, and Maintenance...');
  for (let i = 0; i < 400; i++) {
    const isCompleted = i < 280;
    const isDispatched = i >= 280 && i < 330;
    const isPending = i >= 330 && i < 360;
    const isDraft = i >= 360 && i < 380;
    const isCancelled = i >= 380;

    let status: TripStatus = 'DRAFT';
    if (isCompleted) status = 'COMPLETED';
    else if (isDispatched) status = 'DISPATCHED';
    else if (isPending) status = 'PENDING_APPROVAL';
    else if (isCancelled) status = 'CANCELLED';

    const driver = faker.helpers.arrayElement(drivers);
    const vehicle = faker.helpers.arrayElement(vehicles.filter(v => v.status !== 'RETIRED'));
    const dispatchDate = faker.date.recent({ days: 180 });
    const completionDate = isCompleted ? faker.date.soon({ days: 5, refDate: dispatchDate }) : null;
    const distance = isCompleted ? faker.number.int({ min: 50, max: 3000 }) : null;
    const fuelUsed = isCompleted ? faker.number.int({ min: 10, max: 600 }) : null;

    const trip = await prisma.trip.create({
      data: {
        source: faker.location.city(),
        destination: faker.location.city(),
        driverId: driver.id,
        vehicleId: vehicle.id,
        userId: fm.id,
        cargoWeight: faker.number.int({ min: 500, max: vehicle.capacity }),
        status,
        dispatchDate: isCompleted || isDispatched ? dispatchDate : null,
        completionDate,
        distance,
        fuelUsed,
        finalOdometer: isCompleted ? vehicle.odometer + (distance || 0) : null
      }
    });

    // Seed Trip Status History & Audit Logs
    await prisma.auditLog.create({
      data: { action: 'CREATE', entity: 'TRIP', entityId: trip.id, userId: fm.id }
    });

    if (isCompleted || isDispatched || isCancelled) {
      await prisma.tripStatusHistory.create({
        data: {
          tripId: trip.id,
          previousStatus: 'DRAFT',
          status: 'DISPATCHED',
          changedBy: fm.id,
          remarks: 'Dispatched by Fleet Manager',
          timestamp: dispatchDate || faker.date.recent({ days: 30 })
        }
      });
      await prisma.auditLog.create({
        data: { action: 'DISPATCH_TRIP', entity: 'TRIP', entityId: trip.id, userId: fm.id }
      });
    }

    if (isCompleted) {
       await prisma.tripStatusHistory.create({
        data: {
          tripId: trip.id,
          previousStatus: 'DISPATCHED',
          status: 'COMPLETED',
          changedBy: driver.userId || fm.id,
          remarks: 'Trip completed successfully',
          timestamp: completionDate || faker.date.recent({ days: 5 })
        }
      });
      await prisma.auditLog.create({
        data: { action: 'COMPLETE_TRIP', entity: 'TRIP', entityId: trip.id, userId: driver.userId || fm.id }
      });
    }

    if (isCancelled) {
       await prisma.tripStatusHistory.create({
        data: {
          tripId: trip.id,
          previousStatus: 'DRAFT',
          status: 'CANCELLED',
          changedBy: fm.id,
          remarks: 'Trip cancelled by seeder',
          timestamp: faker.date.recent({ days: 2 })
        }
      });
      await prisma.auditLog.create({
        data: { action: 'CANCEL_TRIP', entity: 'TRIP', entityId: trip.id, userId: fm.id }
      });
    }

    if (isCompleted && fuelUsed) {
      await prisma.fuelLog.create({
        data: {
          vehicleId: vehicle.id,
          tripId: trip.id,
          liters: fuelUsed,
          cost: fuelUsed * faker.number.float({ min: 3, max: 6 }),
          date: completionDate || new Date()
        }
      });

      // 60% chance of an expense on a trip
      if (Math.random() > 0.4) {
        await prisma.expense.create({
          data: {
            vehicleId: vehicle.id,
            expenseType: faker.helpers.arrayElement(['TOLL', 'REPAIR', 'MAINTENANCE', 'OTHER']),
            amount: faker.number.int({ min: 10, max: 800 }),
            description: faker.lorem.words(3),
            date: completionDate || new Date()
          }
        });
      }
    }
  }

  // 6. Seed Maintenance
  for (let i = 0; i < 60; i++) {
    const vehicle = faker.helpers.arrayElement(vehicles);
    const isOpen = i < 15; // 15 open, 45 closed

    const isHighCost = i === 50; // Create one extremely high cost maintenance for the insights widget
    const cost = isOpen ? null : (isHighCost ? faker.number.int({ min: 20000, max: 50000 }) : faker.number.int({ min: 100, max: 3000 }));

    await prisma.maintenance.create({
      data: {
        vehicleId: vehicle.id,
        maintenanceType: faker.helpers.arrayElement(['ROUTINE', 'REPAIR', 'INSPECTION']),
        description: isHighCost ? 'Major Engine Overhaul' : faker.lorem.sentence(),
        status: isOpen ? 'OPEN' : 'CLOSED',
        cost: cost,
        startDate: faker.date.recent({ days: 90 }),
        endDate: isOpen ? null : faker.date.recent({ days: 60 })
      }
    });

    // Also add an expense record for closed maintenance to inflate the total cost
    if (!isOpen && cost) {
       await prisma.expense.create({
          data: {
            vehicleId: vehicle.id,
            expenseType: 'MAINTENANCE',
            amount: cost,
            description: isHighCost ? 'Major Engine Overhaul' : 'Routine shop service',
            date: faker.date.recent({ days: 60 })
          }
        });
    }
  }

  console.log('Extensive Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
