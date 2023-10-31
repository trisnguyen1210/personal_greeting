import { appendFileSync, writeFileSync } from 'fs';
import { faker } from '@faker-js/faker';

faker.locale = 'vi';
const filePath = `${process.cwd()}/upload/data.csv`;
writeFileSync(filePath, 'STT;FULL_NAME;MOBILE;GENDER;UPDATED_DATE;DOB\n');
const maxRecCount = 3_000;

for (let i = 0; i < maxRecCount; i++) {
   const phoneNumber = faker.phone.phoneNumber('0##########');
   const [middleName, lastName, firstName] = faker.name.findName().split(' ');
   const fullName = `${firstName} ${middleName} ${lastName}`;
   appendFileSync(filePath, `${i};${fullName};${phoneNumber};none;none;none\n`);
}

process.stdout.write('dump user data done\n');
