echo "timezone Setting"
ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

echo "Waiting Docker Database ..."
dockerize -wait tcp://mysql-database:3306 -timeout 30s

echo "Apply Prisma generate"
npm run generate:dev

echo "Apply Prisma db push"
npm run db_push:dev

echo "Start Server"
npm run start:dev