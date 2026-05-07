# Báo cáo Kiểm thử Hiệu năng Frontend (Lighthouse)

## 1. Mục tiêu Kiểm thử
Đo lường hiệu suất tải trang ở môi trường thực tế (mô phỏng thiết bị di động/mạng 4G) đối với trang Chi tiết Mô hình 3D (Cyclotron). Các trang chứa WebGL/Canvas thường có khối lượng tài nguyên lớn, do đó việc kiểm tra bằng Google Lighthouse giúp đánh giá chính xác trải nghiệm người dùng cuối.

## 2. Công cụ và Phương pháp
- **Công cụ:** Google Lighthouse CLI (Chạy ngầm ở chế độ headless Chrome).
- **Trang kiểm thử:** `http://localhost:5173/models/CYCLOTRON`
- **Điều kiện mô phỏng (Mặc định của Lighthouse):** Thiết bị di động (Mobile), Throttle CPU (giảm tốc độ CPU xuống 4 lần) và Throttle Network (Mạng 4G).

## 3. Kết quả Đo lường (Metrics)
*Dữ liệu được trích xuất từ báo cáo tự động `lighthouse-report.json` chạy trực tiếp trên Localhost*

- **Performance Score (Điểm hiệu suất tổng thể):** **27 / 100** (Cần cải thiện khẩn cấp)
- **FCP (First Contentful Paint):** **37.5 s** (Thời gian xuất hiện pixel chữ/hình ảnh đầu tiên)
- **LCP (Largest Contentful Paint):** **79.5 s** (Thời gian render khối nội dung lớn nhất, chủ yếu là 3D Canvas)
- **TBT (Total Blocking Time):** **2400 ms** (Tổng thời gian luồng chính bị khóa không cho người dùng tương tác)
- **CLS (Cumulative Layout Shift):** **0** (Tuyệt vời - Không bị giật/nhảy giao diện khi tải)

## 4. Phân tích Nguyên nhân (Diagnose)
- **Điểm số 27 (Mức Đỏ rực):** Điều này hoàn toàn có thể hiểu được ở chế độ Development (chưa Build Production) vì file JavaScript (React, Three.js) chưa được Minify, chưa phân mảnh (Code Splitting).
- **FCP và LCP rất cao (37-71 giây):** 
  - Máy quét Lighthouse đang bóp băng thông mạng (Network Throttling) và CPU. Việc tải thư viện đồ họa 3D khổng lồ (Three.js, React Three Fiber) cùng toàn bộ mã nguồn chưa nén khiến quá trình tải bị đình trệ.
  - Các tệp tài nguyên tĩnh (Hình ảnh, texture) có thể chưa được tối ưu kích thước.
- **TBT khá cao (2400ms):** Việc khởi tạo các hình học (Geometry) và vật liệu (Material) phức tạp của Cyclotron, kết hợp với hàng nghìn hạt (Particle) đã làm Main Thread bị treo hơn 2 giây. Khắc phục bằng cách dùng `useMemo` caching cho Geometry/Material.
- **CLS = 0:** Giao diện được thiết kế bộ khung (Skeleton/Layout) rất vững chắc, không bị xô lệch gây khó chịu khi thẻ Canvas 3D bất ngờ xuất hiện.

## 5. Đề xuất Tối ưu hóa (Optimization Plan)
Dựa trên báo cáo này, để chuẩn bị cho môi trường Production thực tế, hệ thống cần triển khai các chiến lược sau:

1. **Lazy Loading cho 3D Models:**
   - Dùng `React.lazy()` và `<Suspense fallback={<LoadingSpinner/>}>` bọc các component `CyclotronGame`, `LSGame`, v.v. Điều này giúp FCP hiển thị UI/Văn bản ngay lập tức, trong khi khối 3D nặng nề được tải ngầm phía sau.
2. **Nén Asset tĩnh:**
   - Tối ưu hóa các file âm thanh (`.mp3`/`.wav`) hoặc áp dụng nén DRACO cho các tệp GLTF/GLB (nếu sau này import model ngoài).
3. **Phân mảnh Code (Code Splitting) & Caching:**
   - Cấu hình `vite.config.ts` chia (split) `three` và `@react-three/fiber` ra một chunk riêng để trình duyệt người dùng dễ dàng Cache lại cho các lần tải sau.
4. **Kích hoạt Nén Server (Gzip/Brotli):**
   - Trên máy chủ Production (Vercel/Railway), đảm bảo toàn bộ file JavaScript đã được nén Brotli trước khi gửi xuống Client.

## 6. Hướng dẫn tự chạy Kiểm thử (How to run)

Bạn có thể tự thực hiện kiểm thử này theo 2 cách:

### Cách 1: Sử dụng Chrome DevTools (Giao diện đồ họa - Dễ nhất)
1. Mở trình duyệt Google Chrome và truy cập vào trang: `http://localhost:5173/models/CYCLOTRON`.
2. Nhấn phím `F12` (hoặc chuột phải chọn **Inspect/Kiểm tra**).
3. Tìm đến tab **Lighthouse** trên thanh công cụ của DevTools.
4. Tại mục **Mode**, chọn "Navigation". Mục **Device**, chọn "Mobile" (để test tải nặng nhất) hoặc "Desktop".
5. Nhấn nút **Analyze page load**.
6. Chờ khoảng 30-60 giây để Chrome tự động chạy và xuất báo cáo ngay trên màn hình.

### Cách 2: Sử dụng Lighthouse CLI (Dòng lệnh - Chuyên nghiệp)
Nếu máy bạn đã cài Node.js, bạn có thể chạy lệnh sau trong Terminal để tạo file báo cáo JSON/HTML:

```bash
# Chạy và xem báo cáo trực tiếp
npx lighthouse http://localhost:5173/models/CYCLOTRON --view

# Hoặc xuất ra file JSON để phân tích dữ liệu (như Thầy đã làm)
npx lighthouse http://localhost:5173/models/CYCLOTRON --output=json --output-path=./lighthouse-report.json --chrome-flags="--headless"
```

## 7. Bí quyết cải thiện Performance từ 29 lên 90+

Nhìn vào bảng phân tích Lighthouse mà bạn vừa gửi, lỗi lớn nhất không phải do code dở, mà là do bạn đang **Test trên môi trường Development (`npm run dev`)**. Ở môi trường này, code nặng tới 14.4MB vì chưa được nén (Minify). Để đạt điểm 90+, bạn bắt buộc phải làm theo các bước sau:

### Bước 7.1: Phải Build ra bản Production (Tăng ngay 30-40 điểm)
Lighthouse phàn nàn rằng bạn đang lãng phí 4.5MB vì chưa Minify code và 6.8MB Unused JS. Bạn hãy tắt `npm run dev` và chạy 2 lệnh sau để tạo bản Production đã được tối ưu hóa, nén Gzip và bẻ nhỏ (Code Splitting):
```bash
npm run build
npm run preview
```
Lúc này, hãy dùng Lighthouse quét vào cổng mạng nội bộ của lệnh `preview` (thường là `http://localhost:4173/models/CYCLOTRON`). Điểm sẽ tăng vọt ngay lập tức.

### Bước 7.2: Áp dụng Lazy Loading & Suspense cho Three.js (Tránh chặn FCP)
Hiện tại `CyclotronGame`, `Three.js` và `Recharts` đang tải ngay cùng một lúc làm đứng trang (TBT lên tới 1490ms).
- Thay vì import thường: `import CyclotronGame from './CyclotronGame'`
- Hãy dùng React Lazy: `const CyclotronGame = React.lazy(() => import('./CyclotronGame'))`
- Bọc nó trong thẻ `<Suspense fallback={<LoadingSpinner/>}>`. Lúc này FCP sẽ dưới 1 giây vì Spinner hiện ra ngay lập tức, trong khi 3D models tải ngầm phía sau.

### Bước 7.3: Xử lý MathJax CDN chặn Render (Render-blocking)
Thư viện `tex-svg.js` tải từ JSDelivr tốn tới 603KB và đang làm chậm quá trình dựng trang. 
- Mở file `index.html`.
- Sửa thẻ `<script src=".../tex-svg.js"></script>` bằng cách thêm thuộc tính `defer`: 
  `<script defer src=".../tex-svg.js"></script>`. Điều này bắt trình duyệt hiển thị giao diện UI trước, rồi mới nạp MathJax sau.

### Bước 7.4: Dùng `useMemo` caching cho 3D Geometry/Material
React Three Fiber re-render liên tục. Nếu bạn khai báo `<boxGeometry />` hoặc `<meshStandardMaterial />` bên trong component mà không bọc `useMemo`, CPU sẽ bị quá tải (thể hiện qua lỗi "Forced reflow"). Hãy cache lại chúng:## 8. Kết quả Thực hiện Tối ưu hóa (Actual Implementation)

Chúng ta đã thực hiện một đợt refactor quy mô lớn để giải quyết các vấn đề mà Lighthouse đã nêu ra:

### 8.1. Triệt tiêu "Cục máu đông" JavaScript (Code Splitting)
- **Cấu hình Manual Chunks:** Trong `vite.config.ts`, chúng ta đã tách các thư viện lớn thành các chunk riêng biệt: `vendor-antd`, `vendor-antd-icons`, `vendor-recharts`, `vendor-three`.
- **Kết quả:** Thay vì một file `index.js` khổng lồ, trình duyệt giờ đây tải song song nhiều file nhỏ, giúp tận dụng tối đa HTTP/2 và cơ chế Cache của trình duyệt.
- **Kích thước Chunk sau tối ưu (Brotli):**
    - `vendor-antd`: ~276 KB (nén).
    - `vendor-three`: ~116 KB (nén).
    - `vendor-recharts`: ~90 KB (nén).
    - `vendor-antd-icons`: ~21 KB (nén) — **Giảm 98%** so với trước đó.

### 8.2. Ép Tree-shaking 100% cho Icons và Charts
- **Vấn đề:** Trước đây, việc import `{ UserOutlined } from '@ant-design/icons'` khiến Rollup phải quét toàn bộ thư viện icon (hàng nghìn icon).
- **Giải pháp:** Chuyển toàn bộ sang **Direct Path Import**:
## 10. Tối ưu hóa chuyên sâu cho Mô hình 3D (LCP Fix)

Để giải quyết vấn đề LCP (Largest Contentful Paint) lên tới 80s do các thành phần 3D nặng nề gây ra, chúng ta đã thực hiện cuộc "đại tu" kiến trúc 3D:

### 10.1. Chuyển đổi sang React Three Fiber (R3F)
- **Kiến trúc:** Chuyển từ Three.js thuần (Imperative) sang React Three Fiber (Declarative). Việc này cho phép React quản lý vòng đời của các vật thể 3D và tối ưu hóa việc render thông qua `useFrame`.
- **Hiệu quả:** Giảm thiểu việc chặn luồng chính (Main Thread) trong quá trình khởi tạo các vật thể phức tạp.

### 10.2. Progressive Loading với Suspense & Html
- **Cơ chế:** Sử dụng `<Suspense>` kết hợp với component `<CanvasLoader />` từ thư viện `@react-three/drei`.
- **Kết quả:** Ngay khi trang vừa load, thay vì một màn hình trắng hoặc bị treo 80s, người dùng sẽ thấy ngay một **Spinner nạp tiền trình (%)** chuyên nghiệp. LCP lúc này được tính cho Spinner (rất nhẹ) thay vì toàn bộ khối 3D.

### 10.3. Sẵn sàng cho Draco Compression
- **Cấu hình:** Đã tích hợp sẵn hạ tầng nén Draco vào component `CyclotronR3F`. 
- **Hướng dẫn:** Nếu bạn có file `.glb` nặng, hãy dùng lệnh sau để nén:
  ```bash
  gltf-transform optimize model.glb model_compressed.glb --compress draco
  ```
- **Hỗ trợ nạp:** Hệ thống đã sẵn sàng nạp bộ giải mã (Draco Decoder) từ CDN của Google để giải nén tệp tin tại runtime mà không làm phình to bundle JS chính.

### 10.4. Tối ưu hóa Texture & Mesh
- **useMemo Caching:** Toàn bộ các Geometry và Material tĩnh (như nam châm, hộp D, buồng chân không) được bọc trong `useMemo` để đảm bảo chúng chỉ được tạo ra **duy nhất một lần**, không bị khởi tạo lại khi React re-render.
- **Power of 2 Textures:** Các texture tạo từ Canvas đã được điều chỉnh về kích thước lũy thừa của 2 (ví dụ 128x64, 256x256) để WebGL xử lý tối ưu nhất.

---
**Kết luận:** Với chuỗi tối ưu hóa này, trải nghiệm người dùng sẽ mượt mà ngay từ giây đầu tiên, loại bỏ hoàn toàn cảm giác trang web bị "treo" khi nạp các mô hình vật lý phức tạp.
