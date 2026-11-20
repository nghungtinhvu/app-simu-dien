# Mô phỏng tủ điện (App Simu Điện)

Ứng dụng web mô phỏng tủ điện điều khiển, lấy cảm hứng từ EveryPanel: kéo thả linh kiện, đi dây giữa các cực, bấm ▶ để chạy mô phỏng — dây có điện sáng lên, contactor hút, động cơ quay, CB nhảy khi ngắn mạch.

**Mở app:** https://nghungtinhvu.github.io/app-simu-dien/

## Cài như ứng dụng
- **Máy tính (Chrome / Edge):** mở link, bấm biểu tượng cài đặt ở cuối thanh địa chỉ.
- **Android (Chrome):** menu ⋮ → *Thêm vào màn hình chính* / *Cài đặt ứng dụng*.
- **iPhone / iPad (Safari):** nút Chia sẻ → *Thêm vào MH chính*.

Sau lần mở đầu tiên, app chạy được cả khi mất mạng.

## Tính năng
- 68 linh kiện: nguồn 3P/1P, bộ nguồn 24VDC, biến áp; MCB (đặc tính B/C/D), MPCB, cầu chì gG, RCCB/RCBO, rơ le nhiệt, rơ le bảo vệ pha; contactor + khối phụ; rơ le trung gian, timer, timer Y/Δ, rơ le xung, rơ le nháy; nút nhấn, E-stop, công tắc xoay, biến trở 0–10 V; đèn, còi, đèn tháp; động cơ 3 pha / 6 đầu dây / 1 pha / DC, quạt, sưởi, van điện từ; cảm biến PNP/NPN, phao, thermostat, áp suất, cảm biến analog 4–20 mA; vôn kế, ampe kế, đếm giờ, thứ tự pha; biến tần (đặt tần số bằng thông số, AI 0–10 V hoặc 4–20 mA); PLC mini có AI0/AI1/AQ0; bơm ly tâm 1P/3P; rơ le phao điện 61F; công tắc dòng chảy; bồn nước; băng tải; xy lanh khí nén + van 5/2.
- Mô phỏng: điện áp AC/DC, cuộn hút sai điện áp bị cháy, ngắn mạch làm thiết bị bảo vệ nhảy, mất pha, đảo chiều, sao – tam giác.
- **Dòng điện:** mỗi tải có dòng định mức; động cơ có dòng khởi động (~6×In trực tiếp, ~2×In khi sao, không có khi chạy qua biến tần), có thể giả lập kẹt rôto (bấm vào động cơ khi đang chạy) và chỉnh % tải. MCB cắt từ theo đặc tính B/C/D và cắt nhiệt theo thời gian; MPCB, rơ le nhiệt class 10, cầu chì gG cắt theo dòng; sau khi tác động phải chờ nguội mới đặt lại được. Động cơ không được bảo vệ sẽ cháy nếu quá dòng kéo dài.
- **Analog:** biến trở 0–10 V và cảm biến 4–20 mA (chỉnh tay hoặc đo mức bồn); PLC so sánh `AI0 > 50`, xuất `AQ0 = AI0`; dây tín hiệu analog hiện màu tím khi chạy.
- 11 ví dụ: khởi động trực tiếp (thử kẹt rôto), đảo chiều, sao – tam giác, PLC, bơm theo phao cơ, biến tần, bơm bằng rơ le 61F + cảm biến dòng chảy, băng tải đếm sản phẩm bằng PLC, xy lanh khí nén bằng PLC, biến tần đặt tốc độ bằng biến trở + ampe kế, bơm theo cảm biến mức 4–20 mA bằng PLC.
- Đi dây tự động tránh linh kiện và tránh chồng dây; chọn dây để kéo đoạn, thêm / xóa điểm uốn (nhấp đúp).
- Hoạt ảnh: bơm ly tâm quay + nước chảy, bồn nước gợn sóng, băng tải, xy lanh khí nén, quạt, động cơ.
- Xoay linh kiện (phím R), hoàn tác / làm lại, xuất / nhập dự án dạng JSON.

## Lưu dữ liệu
Dự án được lưu trong trình duyệt của từng máy (IndexedDB, kèm bản dự phòng trong localStorage). Nút **tải xuống** ở màn hình chính sao lưu tất cả dự án ra một file `.json`; dùng **Nhập** để khôi phục hoặc chuyển sang máy khác (nhận cả file một dự án lẫn file sao lưu). Mỗi dự án cũng có nút xuất riêng (sao chép hoặc tải file).

## Kiểm thử
`python3 tests/run.py` chạy 298 phép kiểm tra logic cho cả 68 loại thiết bị và các ví dụ (cần Playwright + Chromium).

## Cập nhật app
Sửa `index.html`, đổi `VERSION` trong `sw.js` (ví dụ `simu-v6`) rồi commit — GitHub Pages tự đăng bản mới sau khoảng 1 phút.
