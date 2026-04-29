import { test, expect } from '@playwright/test';

test.describe('Luồng người dùng cốt lõi (Core User Flows)', () => {

  test('Người dùng đăng nhập thành công và xem được chi tiết mô hình Cyclotron', async ({ page }) => {
    
    // --------------------------------------------------------
    // BƯỚC 1: ĐĂNG NHẬP
    // --------------------------------------------------------
    await page.goto('http://localhost:5173/login');

    await page.getByPlaceholder('Username / Email').fill('student');
    await page.getByPlaceholder('Password').fill('123456');
    
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    // --------------------------------------------------------
    // BƯỚC 2: KIỂM TRA TRANG CHỦ (HOME)
    // --------------------------------------------------------
    // Đảm bảo URL đã chuyển hướng thành công
    await expect(page).toHaveURL(/.*\/models/);

    // Kiểm tra UI đã load xong (Tìm một thẻ mô hình làm mốc)
    // Ví dụ text 'Cyclotron'
    await expect(page.getByText('Cyclotron').first()).toBeVisible({ timeout: 10000 });

    // --------------------------------------------------------
    // BƯỚC 3: TÌM VÀ CHỌN MÔ HÌNH CYCLOTRON
    // --------------------------------------------------------
    const cyclotronCard = page.locator('.ant-card').filter({ hasText: 'Cyclotron' }).first();
    await expect(cyclotronCard).toBeVisible();

    // Bấm vào nút xem chi tiết (Xem thêm)
    await cyclotronCard.getByText('Xem thêm').click();

    // --------------------------------------------------------
    // BƯỚC 4: KIỂM TRA TRANG CHI TIẾT (MODEL DETAIL)
    // --------------------------------------------------------
    await expect(page).toHaveURL(/.*\/cyclotron/i);

    // KIỂM TRA QUAN TRỌNG NHẤT: Thẻ <canvas> chứa 3D phải xuất hiện
    const threeCanvas = page.locator('canvas').first();
    await expect(threeCanvas).toBeVisible({ timeout: 15000 }); 

    // Kiểm tra các Tab chức năng có render đúng không (dùng regex /.../i để bỏ qua hoa thường)
    await expect(page.getByText(/Lý thuyết/i).first()).toBeVisible();
    await expect(page.getByText(/Bài tập mẫu/i).first()).toBeVisible();
  });

});
