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
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 3. Seed Users & Drivers
  console.log('Seeding Users and Drivers...');
  const fm = await prisma.user.create({ data: { name: 'Admin Fleet', email: 'fm@transitops.local', password: hashedPassword, role: 'FLEET_MANAGER' } });
  const so = await prisma.user.create({ data: { name: 'Safety Officer', email: 'so@transitops.local', password: hashedPassword, role: 'SAFETY_OFFICER' } });
  const fa = await prisma.user.create({ data: { name: 'Finance Analyst', email: 'fa@transitops.local', password: hashedPassword, role: 'FINANCIAL_ANALYST' } });
  
  const drivers = [];
  for (let i = 0; i < 25; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phoneNumber: faker.phone.number(),
        password: hashedPassword,
        role: 'DRIVER'
      }
    });

    const licenseExpiry = faker.date.future({ years: 3 });
    const status = faker.helpers.arrayElement(['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'ON_TRIP', 'OFF_DUTY'] as DriverStatus[]);
    
    const driver = await prisma.driver.create({
      data: {
        userId: user.id,
        name: user.name,
        licenseNumber: faker.vehicle.vrm(),
        licenseCategory: faker.helpers.arrayElement(['HEAVY', 'LIGHT', 'HAZMAT']),
        licenseExpiry,
        contactNumber: user.phoneNumber || faker.phone.number(),
        status,
        safetyScore: faker.number.int({ min: 60, max: 100 })
      }
    });
    drivers.push(driver);
  }

  // 4. Seed Vehicles & Compliances
  console.log('Seeding Vehicles and Compliances...');
  const vehicles = [];
  for (let i = 0; i < 30; i++) {
    const status = faker.helpers.arrayElement(['AVAILABLE', 'AVAILABLE', 'ON_TRIP', 'ON_TRIP', 'IN_SHOP', 'RETIRED'] as VehicleStatus[]);
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

    // Add compliances if not retired
    if (status !== 'RETIRED') {
      await prisma.vehicleCompliance.create({
        data: {
          vehicleId: vehicle.id,
          type: 'INSURANCE',
          certificateNumber: faker.string.alphanumeric(10),
          issueDate: faker.date.past({ years: 1 }),
          expiryDate: faker.date.future({ years: 1 })
        }
      });
      await prisma.vehicleCompliance.create({
        data: {
          vehicleId: vehicle.id,
          type: 'REGISTRATION',
          certificateNumber: faker.string.alphanumeric(10),
          issueDate: faker.date.past({ years: 1 }),
          expiryDate: faker.date.future({ years: 1 })
        }
      });
    }
  }

  // 5. Seed Trips
  console.log('Seeding Trips, Logs, and Maintenance...');
  for (let i = 0; i < 100; i++) {
    const isCompleted = i < 70;
    const isDispatched = i >= 70 && i < 90;
    const isDraft = i >= 90;

    let status: TripStatus = 'DRAFT';
    if (isCompleted) status = 'COMPLETED';
    else if (isDispatched) status = 'DISPATCHED';

    const driver = faker.helpers.arrayElement(drivers);
    const vehicle = faker.helpers.arrayElement(vehicles.filter(v => v.status !== 'RETIRED'));
    const dispatchDate = faker.date.recent({ days: 180 });
    const completionDate = isCompleted ? faker.date.soon({ days: 3, refDate: dispatchDate }) : null;
    const distance = isCompleted ? faker.number.int({ min: 100, max: 2000 }) : null;
    const fuelUsed = isCompleted ? faker.number.int({ min: 20, max: 400 }) : null;

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

    if (isCompleted && fuelUsed) {
      await prisma.fuelLog.create({
        data: {
          vehicleId: vehicle.id,
          tripId: trip.id,
          liters: fuelUsed,
          cost: fuelUsed * faker.number.float({ min: 3, max: 5 }),
          date: completionDate || new Date()
        }
      });

      // 50% chance of an expense on a trip
      if (Math.random() > 0.5) {
        await prisma.expense.create({
          data: {
            vehicleId: vehicle.id,
            expenseType: faker.helpers.arrayElement(['TOLL', 'REPAIR', 'MAINTENANCE', 'OTHER']),
            amount: faker.number.int({ min: 20, max: 500 }),
            description: faker.lorem.words(3),
            date: completionDate || new Date()
          }
        });
      }
    }
  }

  // 6. Seed Maintenance
  for (let i = 0; i < 30; i++) {
    const vehicle = faker.helpers.arrayElement(vehicles);
    const isOpen = i < 10; // 10 open, 20 closed

    await prisma.maintenance.create({
      data: {
        vehicleId: vehicle.id,
        maintenanceType: faker.helpers.arrayElement(['ROUTINE', 'REPAIR', 'INSPECTION']),
        description: faker.lorem.sentence(),
        status: isOpen ? 'OPEN' : 'CLOSED',
        cost: isOpen ? null : faker.number.int({ min: 100, max: 5000 }),
        startDate: faker.date.recent({ days: 90 }),
        endDate: isOpen ? null : faker.date.recent({ days: 60 })
      }
    });
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
