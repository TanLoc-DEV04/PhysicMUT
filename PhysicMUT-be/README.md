# Hướng dẫn sử dụng Prisma & Quản lý Database (PostgreSQL & Railway)

Tài liệu này hướng dẫn cách làm việc với Prisma, cách cập nhật dữ liệu qua `seed.js`, thay đổi `schema`, quản lý database trên pgAdmin và mẹo cập nhật dữ liệu trực tiếp lên Railway.

## 1. Cập nhật Schema (`schema.prisma`)

Khi bạn cần thêm bảng mới hoặc chỉnh sửa các cột hiện tại:

1. Mở file `prisma/schema.prisma` và thực hiện các thay đổi. Ví dụ:
   ```prisma
   model User {
     id    Int     @id @default(autoincrement())
     email String  @unique
     name  String?
   }
   ```
2. Sau khi lưu lại, chạy lệnh sau để đồng bộ schema với database local (PostgreSQL) và cập nhật lại Prisma Client:
   ```bash
   npx prisma db push
   # Hoặc nếu bạn muốn tạo file migration để theo dõi lịch sử:
   # npx prisma migrate dev --name <tên-migration>
   ```

## 2. Cập nhật dữ liệu mẫu (`seed.js`)

File `seed.js` giúp tự động chèn các dữ liệu khởi tạo (dữ liệu mẫu) vào database.

1. Mở file `prisma/seed.js` (hoặc `prisma/seed.ts` tùy dự án).
2. Viết code Prisma Client để chèn dữ liệu. Ví dụ:
   ```javascript
   const { PrismaClient } = require('@prisma/client');
   const prisma = new PrismaClient();

   async function main() {
     await prisma.user.upsert({
       where: { email: 'test@example.com' },
       update: {},
       create: {
         email: 'test@example.com',
         name: 'Test User',
       },
     });
   }

   main()
     .catch((e) => {
       console.error(e);
       process.exit(1);
     })
     .finally(async () => {
       await prisma.$disconnect();
     });
   ```
3. Chạy lệnh để đẩy dữ liệu seed vào database:
   ```bash
   npx prisma db seed
   ```
   *(Lưu ý: Để lệnh này hoạt động, trong `package.json` cần cấu hình key `prisma.seed` trỏ tới file seed, ví dụ: `"prisma": { "seed": "node prisma/seed.js" }`)*.

## 3. Quản lý và Cập nhật dữ liệu qua pgAdmin

`pgAdmin` là công cụ giao diện UI để quản trị PostgreSQL.

1. Mở pgAdmin và kết nối với server PostgreSQL local của bạn.
2. Mở rộng cây thư mục: `Servers` > `Tên_Server` > `Databases` > `Tên_DB_của_bạn` > `Schemas` > `public` > `Tables`.
3. Chuột phải vào bảng bạn muốn xem/sửa, chọn **View/Edit Data** > **All Rows**.
4. Giao diện dạng bảng (giống Excel) sẽ hiện ra. Bạn có thể:
   - **Thêm dòng:** Nhấn vào dòng trống dưới cùng và nhập dữ liệu.
   - **Sửa dòng:** Click đúp vào ô cần sửa và nhập lại.
   - **Lưu lại:** Sau khi chỉnh sửa, nhấn nút **Save Data Changes** (biểu tượng cái đĩa mềm/mũi tên lưu) ở thanh công cụ phía trên để commit thay đổi vào database.

> **Mẹo nhỏ:** Để tránh thao tác nhầm hoặc nếu không thích pgAdmin, bạn có thể dùng **Prisma Studio** (công cụ UI có sẵn của Prisma) bằng lệnh: `npx prisma studio`. Giao diện này sẽ mở trên trình duyệt, rất dễ nhìn và thân thiện.

## 4. Mẹo (Trick) cập nhật Schema & Dữ liệu trực tiếp lên Railway

Khi ứng dụng đã lên môi trường production trên Railway, bạn cũng sẽ cần cập nhật cấu trúc bảng hoặc seed dữ liệu mới.

### Cách 1: Đổi trực tiếp chuỗi kết nối (`DATABASE_URL`) - Nhanh, thường dùng khi không có CLI
Nếu bạn không cài Railway CLI trên máy, bạn có thể "mượn" kết nối trực tiếp đến database thật:

1. Lên dashboard của Railway, vào mục **Variables** của **Postgres Database**, copy đường dẫn kết nối (Connection String / `DATABASE_URL`).
2. Mở file `.env` ở máy tính (local) của bạn.
3. Chú thích (comment out) dòng `DATABASE_URL` local, và thay bằng URL của Railway:
   ```env
   # DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"
   DATABASE_URL="postgresql://postgres:<password_railway>@<host_railway>:<port>/<db_name>?schema=public"
   ```
4. Chạy lệnh push schema lên Railway:
   ```bash
   npx prisma db push
   ```
5. Chạy lệnh seed để đẩy dữ liệu khởi tạo lên Railway:
   ```bash
   npx prisma db seed
   ```
6. **QUAN TRỌNG:** Sau khi thực hiện xong, nhớ đổi `DATABASE_URL` trong file `.env` lại thành URL local để tiếp tục quá trình code trên máy của bạn.

### Cách 2: Dùng Railway CLI
Nếu bạn đã cài Railway CLI (`npm i -g @railway/cli`) và đã link thư mục dự án với project trên Railway (`railway link`):

```bash
# Push schema lên database của Railway bằng environment variable của Railway
railway run npx prisma db push

# Chạy seed lên database của Railway
railway run npx prisma db seed
```
