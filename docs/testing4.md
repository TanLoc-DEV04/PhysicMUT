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
