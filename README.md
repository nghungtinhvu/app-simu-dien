# Mô phỏng tủ điện (App Simu Điện)

Ứng dụng web mô phỏng tủ điện điều khiển, lấy cảm hứng từ EveryPanel: kéo thả linh kiện, đi dây giữa các cực, bấm ▶ để chạy mô phỏng — dây có điện sáng lên, contactor hút, động cơ quay, CB nhảy khi ngắn mạch.

**Mở app:** https://nghungtinhvu.github.io/app-simu-dien/

## Cài như ứng dụng
- **Máy tính (Chrome / Edge):** mở link, bấm biểu tượng cài đặt ở cuối thanh địa chỉ.
- **Android (Chrome):** menu ⋮ → *Thêm vào màn hình chính* / *Cài đặt ứng dụng*.
- **iPhone / iPad (Safari):** nút Chia sẻ → *Thêm vào MH chính*.

Sau lần mở đầu tiên, app chạy được cả khi mất mạng.

## Tính năng
- 59 linh kiện: nguồn 3P/1P, bộ nguồn 24VDC, biến áp; MCB, MPCB, cầu chì, RCCB/RCBO, rơ le nhiệt, rơ le bảo vệ pha; contactor + khối phụ; rơ le trung gian, timer, timer Y/Δ, rơ le xung, rơ le nháy; nút nhấn, E-stop, công tắc xoay; đèn, còi, đèn tháp; động cơ 3 pha / 6 đầu dây / 1 pha / DC, quạt, sưởi, van điện từ; cảm biến PNP/NPN, phao, thermostat, áp suất; vôn kế, đếm giờ, thứ tự pha; biến tần; PLC mini lập trình được; bồn nước có phao.
- Mô phỏng: điện áp AC/DC, cuộn hút sai điện áp bị cháy, ngắn mạch làm thiết bị bảo vệ nhảy, mất pha, đảo chiều, sao – tam giác.
- Ví dụ có sẵn: khởi động trực tiếp, đảo chiều, sao – tam giác, PLC, bơm nước theo phao, biến tần.
- Xoay linh kiện (phím R), hoàn tác / làm lại, xuất / nhập dự án dạng JSON.

## Lưu ý
Dự án được lưu trong trình duyệt của từng máy. Để chuyển sang máy khác: ở màn hình chính bấm nút xuất trên dự án, rồi dùng **Nhập dự án** ở máy kia.

## Cập nhật app
Sửa `index.html`, đổi `VERSION` trong `sw.js` (ví dụ `simu-v3`) rồi commit — GitHub Pages tự đăng bản mới sau khoảng 1 phút.
