.envを作成

```sh
WEBDAV_URL="http://path/to/webdav"
WEBDAV_USERNAME="username"
WEBDAV_PASSWORD="password"
SPREADSHEET_PATH="path/to/accounting_data.ods"
STORE_OPTIONS="スーパーA,その他aaabbbcccddd"
PAYMENT_METHOD_OPTIONS="現金,デビットカード"
```

docker-composeで起動、port3000でアクセス

```yml
services:
  my-accounting-app:
    image: ghcr.io/na-trium-144/my-accounting-app:latest
    volumes:
    - ./.env:/app/.env
    networks:
      net200:
        ipv4_address: 192.168.200.17
```
