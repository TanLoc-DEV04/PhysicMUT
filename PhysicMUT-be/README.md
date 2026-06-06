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


### Cách 3: Dùng "Custom Start Command" trên Railway (Tự động khi Deploy)

Nếu bạn không dùng gói Premium của Railway hoặc muốn quá trình cập nhật database hoàn toàn tự động mỗi lần deploy code mới, bạn có thể thiết lập **Custom Start Command** trong phần cấu hình (Settings) của service trên Railway.

Thay vì chỉ khởi động app bằng `node dist/index.js`, hãy nhập lệnh sau vào ô Custom Start Command:

```bash
npx prisma migrate deploy && npx prisma db seed && node dist/index.js
```

**Giải thích lệnh:**
1. `npx prisma migrate deploy`: Áp dụng các thay đổi schema (migration) mới nhất lên database của Railway.
2. `npx prisma db seed`: Tự động chạy lệnh seed để nạp/cập nhật dữ liệu vào database.
3. `node dist/index.js`: Cuối cùng, khởi động server backend của bạn sau khi database đã sẵn sàng.

> **Lưu ý quan trọng cho lệnh seed:** Để `npx prisma db seed` chạy được, bạn phải chắc chắn trong file `package.json` đã có khai báo phần `"prisma": { "seed": "node prisma/seed.js" }` (hoặc lệnh tương ứng chạy file seed của bạn).

---

### Quy trình cập nhật khi có Commit mới trên GitHub

Khi bạn push commit mới lên GitHub, Railway sẽ tự động kích hoạt (trigger) quá trình build và deploy lại dự án. Để quản trị quá trình cập nhật database mà không gặp lỗi, bạn có 2 cách thực hiện:

#### Cách 1: Quy trình thủ công (Chuyển đổi lệnh qua lại trên Railway)
1. **Khi commit có cập nhật DB (Schema) hoặc cần chạy dữ liệu Seed mới:**
   - **Bước 1:** Lên Railway Dashboard, chuyển đổi **Custom Start Command** thành:
     ```bash
     npx prisma migrate deploy && npx prisma db seed && node dist/index.js
     ```
   - **Bước 2:** Thực hiện push commit mới lên GitHub. Railway sẽ chạy lệnh này, tự động nâng cấp DB và seed dữ liệu mới.
   - **Bước 3:** Sau khi ứng dụng deploy thành công (dữ liệu đã vào DB), hãy đổi **Custom Start Command** về lại:
     ```bash
     npx prisma migrate deploy && node dist/index.js
     ```
     *(Điều này giúp tránh việc chạy lại file Seed gây lỗi trùng lặp dữ liệu nếu ứng dụng của bạn tự động restart hoặc deploy các commit sau)*.

2. **Khi commit chỉ sửa code logic thông thường (Không đổi DB, không cần Seed lại):**
   - Giữ nguyên lệnh: `npx prisma migrate deploy && node dist/index.js`. Lệnh này chỉ chạy migration (nếu có file migration mới phát sinh) mà không chạy lại seed, giúp deploy diễn ra trơn tru.

#### Cách 2: Quy trình tự động tối ưu (Khuyên dùng - Không cần đổi lệnh qua lại)
Để tránh phải đổi cấu hình trên Railway thủ công, bạn hãy tối ưu hóa file `prisma/seed.js` để có thể **chạy đi chạy lại nhiều lần mà không bị lỗi trùng dữ liệu** (Idempotent):

1. **Sử dụng `upsert` thay vì `create`:**
   Nếu dùng `upsert`, Prisma sẽ kiểm tra xem bản ghi đó đã tồn tại chưa (dựa vào trường Unique/ID). Nếu có rồi thì chỉ cập nhật (update), chưa có thì mới tạo mới (create).
2. **Kiểm tra số lượng dữ liệu trước khi Seed:**
   ```javascript
   const recordCount = await prisma.user.count(); // hoặc tên bảng khác của bạn
   if (recordCount === 0) {
     // Chỉ chèn dữ liệu mẫu nếu bảng đó chưa có dữ liệu nào
   }
   ```

Khi file `seed.js` đã an toàn (chạy nhiều lần không lỗi), bạn có thể **luôn luôn** giữ **Custom Start Command** cố định là:
```bash
npx prisma migrate deploy && npx prisma db seed && node dist/index.js
```
Mỗi lần push commit mới lên GitHub, Railway sẽ tự động migrate và chạy seed mà không bao giờ gặp lỗi trùng dữ liệu.

---

## 5. Khắc phục lỗi thường gặp trên Railway (Troubleshooting)

### Lỗi 1: `ERROR (catatonit:2): failed to exec pid1: No such file or directory` (ở phía Postgres)
* **Nguyên nhân:** Đây là lỗi phân rã hình ảnh container của Railway (cơ chế cache image bị lỗi hoặc hỏng runtime). Nó khiến container khởi tạo Postgres bị crash-loop liên tục.
* **Cách xử lý:**
  1. Vào dashboard của Railway, bấm chọn service **Postgres**.
  2. Mở Command Palette bằng tổ hợp phím `Ctrl + K` (Windows) hoặc `Cmd + K` (macOS).
  3. Gõ tìm kiếm lệnh: **"Redeploy source image"** và chọn nó.
  4. Railway sẽ tải lại image sạch của Postgres và tự động chạy lại mà không mất dữ liệu hiện có trong volume.

### Lỗi 2: `Error: P1001: Can't reach database server at postgres.railway.internal:5432` (ở phía Backend/Express)
* **Nguyên nhân:** Prisma Client ở phía backend không kết nối được tới database PostgreSQL. Nguyên nhân chính thường là do service Postgres đang bị sập (như Lỗi 1 ở trên).
* **Cách xử lý:**
  1. Kiểm tra trạng thái của service Postgres trước. Hãy sửa lỗi bên Postgres trước (áp dụng Cách khắc phục Lỗi 1).
  2. Sau khi Postgres báo trạng thái **Active** xanh lá, hãy vào dịch vụ Backend của bạn và bấm **Re-deploy** hoặc **Restart** để server kết nối lại.

### Lỗi 3: `Connection terminated unexpectedly` (Kết nối bị ngắt đột ngột)
* **Nguyên nhân:** Lỗi này có thể xảy ra ở cả pgAdmin, Prisma Client (ở máy local hoặc trên Railway) khi đang chạy truy vấn/migration. Các nguyên nhân phổ biến gồm:
  1. **Postgres bị crash/restart:** Do database gặp lỗi container (như Lỗi 1) hoặc bị quá tải tài nguyên (RAM/CPU của gói miễn phí bị tràn), khiến Railway tự động ngắt kết nối.
  2. **Quá giới hạn kết nối (Connection Pool):** Số lượng kết nối mở đồng thời vượt quá giới hạn cho phép của gói Database.
  3. **Mạng/Proxy chập chờn:** Đường truyền mạng hoặc proxy trung gian của Railway bị nghẽn.
* **Cách xử lý:**
  - **Khắc phục nhanh:** Kiểm tra xem Postgres có đang hoạt động ổn định không. Nếu Postgres đang crash-loop, hãy chạy **"Redeploy source image"** cho Postgres. Tiếp theo, hãy bấm **Re-deploy** lại service Backend.
  - **Giới hạn Connection Pool:** Trong chuỗi kết nối `DATABASE_URL` (ở cả `.env` local và biến môi trường trên Railway), hãy giới hạn số lượng kết nối đồng thời và tăng thời gian timeout bằng cách thêm các tham số này vào cuối URL:
    ```env
    DATABASE_URL="postgresql://...&connection_limit=5&connect_timeout=30&pool_timeout=30"
    ```
    *(Thay đổi số `5` tùy thuộc vào giới hạn kết nối của gói Database bạn đang dùng)*.

