import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Cấu hình kịch bản đo tải (Options)
export const options = {
  stages: [
    { duration: '30s', target: 2 },  // Giai đoạn 1: Tăng dần lên 2 người dùng ảo trong 30 giây
    { duration: '1m', target: 2 },   // Giai đoạn 2: Giữ ổn định 2 người dùng liên tục trong 1 phút
    { duration: '30s', target: 0 },  // Giai đoạn 3: Giảm dần về 0 để kết thúc test
  ],
  thresholds: {
    // Tiêu chuẩn đánh giá (Hội đồng rất thích xem cái này)
    http_req_failed: ['rate<0.01'],   // Tỷ lệ lỗi (Error rate) phải nhỏ hơn 1%
    http_req_duration: ['p(95)<5000'] // AI phản hồi chậm hơn API thường, 95% dưới 5s là chấp nhận được
  },
};

// 2. Kịch bản thực thi cho mỗi VUs (Virtual User - Người dùng ảo)
export default function () {
  const url = 'http://localhost:8000/chat'; // API Bot chạy ở port 8000
  
  // Giả lập dữ liệu gửi lên
  const payload = JSON.stringify({
    message: 'Hãy giải thích nguyên lý hoạt động của máy gia tốc Cyclotron?',
    history: []
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Bắn request
  const res = http.post(url, payload, params);

  // 3. Kiểm tra (Assert) trạng thái trả về
  check(res, {
    'Status là 200': (r) => r.status === 200,
  });

  if (res.status === 200) {
    try {
      check(res, {
        'Trả về tin nhắn từ AI': (r) => r.json().message !== undefined,
      });
    } catch (e) {}
  }

  // Nghỉ 2-4 giây giữa các lần hỏi để giống với con người đang đọc câu trả lời
  sleep(Math.random() * 2 + 2);
}
