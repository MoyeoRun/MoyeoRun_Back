echo "timezone Setting"
ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

echo "Waiting Docker Database ..."
dockerize -wait tcp://mysql-database:3306 -timeout 30s


echo "Start Server"
npm run start:prod