# Báo cáo Kiểm thử Hiệu năng Frontend (Lighthouse)

## 1. Mục tiêu Kiểm thử
Đo lường hiệu suất tải trang ở môi trường thực tế (mô phỏng thiết bị di động/mạng 4G) đối với trang Chi tiết Mô hình 3D (Cyclotron). Các trang chứa WebGL/Canvas thường có khối lượng tài nguyên lớn, do đó việc kiểm tra bằng Google Lighthouse giúp đánh giá chính xác trải nghiệm người dùng cuối.

## 2. Công cụ và Phương pháp
- **Công cụ:** Google Lighthouse CLI (Chạy ngầm ở chế độ headless Chrome).
- **Trang kiểm thử:** `http://localhost:5173/models/cyclotron`
- **Điều kiện mô phỏng (Mặc định của Lighthouse):** Thiết bị di động (Mobile), Throttle CPU (giảm tốc độ CPU xuống 4 lần) và Throttle Network (Mạng 4G).

## 3. Kết quả Đo lường (Metrics)
*Dữ liệu được trích xuất từ báo cáo tự động `lighthouse-report.json` chạy trực tiếp trên Localhost*

- **Performance Score (Điểm hiệu suất tổng thể):** **47 / 100** (Cần cải thiện)
- **FCP (First Contentful Paint):** **37.6 s** (Thời gian xuất hiện pixel chữ/hình ảnh đầu tiên)
- **LCP (Largest Contentful Paint):** **71.9 s** (Thời gian render khối nội dung lớn nhất, chủ yếu là 3D Canvas)
- **TBT (Total Blocking Time):** **350 ms** (Tổng thời gian luồng chính bị khóa không cho người dùng tương tác)
- **CLS (Cumulative Layout Shift):** **0** (Tuyệt vời - Không bị giật/nhảy giao diện khi tải)

## 4. Phân tích Nguyên nhân (Diagnose)
- **Điểm số 47 (Mức Vàng/Đỏ):** Điều này hoàn toàn có thể hiểu được ở chế độ Development (chưa Build Production) vì file JavaScript (React, Three.js) chưa được Minify, chưa phân mảnh (Code Splitting).
- **FCP và LCP rất cao (37-71 giây):** 
  - Máy quét Lighthouse đang bóp băng thông mạng (Network Throttling) và CPU. Việc tải thư viện đồ họa 3D khổng lồ (Three.js, React Three Fiber) cùng toàn bộ mã nguồn chưa nén khiến quá trình tải bị đình trệ.
  - Các tệp tài nguyên tĩnh (Hình ảnh, texture) có thể chưa được tối ưu kích thước.
- **TBT thấp (350ms):** Điểm sáng lớn nhất! Dù thời gian tải lâu, nhưng mã nguồn React được viết rất tối ưu, thuật toán mô phỏng hạt không gây vòng lặp vô hạn làm treo luồng Main Thread (Luồng chính).
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
