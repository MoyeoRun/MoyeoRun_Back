echo "timezone Setting"
ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

echo "Waiting Docker Database ..."
dockerize -wait tcp://mysql-database:3306 -timeout 30s

echo "Apply Prisma generate"
npm run generate:prod

echo "Apply Prisma db push"
npm run db_push:prod

echo "Build Server"
npm run build

echo "Start Server"
npm run start:prod