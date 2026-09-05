# Kiểm tra bản local — 05/09/2026

## Kết nối Cloudflare v202

Worker health đã trả ok/database/managerConfigured=true. Client chuyển sang endpoint Cloudflare; lưu mã sau kết nối thành công; demo không publish thật; đường dẫn link hỗ trợ /CaHoiCS3/. Test cloud-client dùng fetch giả lập xác minh endpoint, authorization, lưu mã, lỗi 401 và thứ tự script. Các bộ smoke/history/snapshot/publishing vẫn PASS. Chưa kiểm thử ghi/đọc bằng mã production do người dùng giữ; chưa đẩy GitHub để tránh rollout chưa xác nhận với quản lý đang dùng thật.

## Lịch bơi — Ver 2.0

Đã đổi title, tên app manifest, apple-mobile-web-app-title, nhãn phiên bản quản lý/nhân viên và trang preview. Giữ nguyên khóa dữ liệu. Kiểm thử trình duyệt khung 375px: vùng nội dung 367px không tràn; tên quán 18px, tiêu đề vùng 17px, khung giờ ca 20px. Đã xem ảnh tiêu đề ca mới: Ca sáng / thời lượng, 07:00 – 12:30 / số người. Smoke thêm kiểm tra tên app và định dạng giờ, gồm ca qua nửa đêm. Chưa thử Safari thiết bị thật hay cập nhật shortcut cũ thực tế.

## Link chung cố định v32

Kiểm thử API PASS: một khóa chung trả lịch cả đội (đã lọc thông tin riêng), khóa nhân viên cũ không truy cập API chung, khóa chung không được publish, URL/key giữ nguyên qua publish nhiều tuần và restart. Nút tải lại chọn tuần mới nhất và giữ bộ lọc tên; cần kiểm thử lại trên iPhone thật. Link cố định phụ thuộc giữ tên miền và file dữ liệu máy chủ.

## Ba ô chuyển chế độ — v31

Đã bỏ hàng tab lặp và hàng nút dưới ba ô. Ba ô là Theo ngày / Theo nhân viên / Tổng kết tuần, có trạng thái aria-pressed. Trình duyệt trực tiếp đã xác nhận chuyển sang tổng kết hiển thị số giờ, lương và trạng thái lưu; chuyển sang nhân viên hiển thị 7 ngày; nút Thao tác mở đúng ba lựa chọn Xếp lịch / Lưu ảnh lịch / Gửi lịch. Bộ smoke, history và publishing đều PASS. Chưa kiểm tra trên Safari thiết bị thật.

## Giao diện Journey + trang nhân viên

- Bộ `tests/publishing.cjs` PASS: xác thực quản lý, cách ly từng nhân viên, loại thông tin riêng, bản nháp không tự gửi, gửi lại một tuần, giữ tuần cũ, đổi link thu hồi link cũ, khởi động lại còn lịch, chặn file nội bộ và mã nhân viên nguy hiểm.
- Bộ lịch sử tuần và smoke vẫn PASS.
- Trình duyệt đã mở trang nhân viên mẫu: Nhật Minh (minh hoạ), 6 lượt ca / 31,5 giờ, đủ 7 ngày, có thời điểm quản lý gửi, không có nút sửa.
- Giao diện quản lý khung 375px: nội dung khả dụng 367px, không tràn ngang; đã xem màu sáng, nút dạng viên, 3 ô dữ liệu và thẻ ca. Chưa kiểm thử thiết bị Safari thật, tải ảnh hoặc chia sẻ clipboard trên iPhone.
- Máy chủ đang dùng dữ liệu mẫu riêng; chưa publish dữ liệu nhân viên thật và chưa có hosting/HTTPS công khai.

## Lịch sử tuần và mốc 24 giờ

`node tests/history.cjs`: kiểm tra 23h chưa chốt, đủ 24h chốt, tuần mới không đổi tuần cũ, sửa lịch cũ cập nhật bản mới và khởi động lại mốc 24h, đọc lại sau đóng app, thay cài đặt không reset đồng hồ. `node tests/smoke.cjs` vẫn kiểm tra thuật toán xếp ca không thay đổi. Cần thử thêm thực tế trên Safari; dữ liệu vẫn là lưu trên thiết bị, không đồng bộ máy chủ.

## Bản tối giản theo ảnh tham khảo

- Điều hướng trực tiếp xác nhận còn 3 mục: Lịch làm, Nhân viên, Thêm.
- Trang Thêm có 7 nhóm thu gọn và lối xem dữ liệu nghỉ cũ khi có dữ liệu.
- Luồng Xếp lịch → Tự chọn người cho từng ca chuyển nút sửa thành Hoàn tất; log tab kiểm thử trực tiếp không có lỗi.
- Khung điện thoại 375px có bề rộng nội dung 367px bằng vùng khả dụng, không tràn ngang; đã xem ảnh bố cục thẻ vàng và danh sách ca.
- Gắn phiên bản tài nguyên v27 để không trộn JavaScript cũ với HTML mới khi cập nhật offline.
- Không kiểm thử Safari/iPhone thật hoặc nhập Google Sheet thật trong lượt này.

## Bản ưu tiên iPhone

- Kiểm tra trong khung 375px: bề rộng nội dung 367px bằng bề rộng khả dụng (trừ viền/scrollbar), không tràn ngang. Thẻ ca đầu ở khoảng y=381px khi có banner mẫu; tên nhân viên 15px.
- Tổng kết tuần thu gọn, đặt sau lịch trên điện thoại. Danh sách 7 ngày theo một nhân viên thay cho bảng ngang.
- Chọn Hoàng Nam trong danh sách, chạm ngày đầu mở đúng hộp sửa Hoàng Nam; đóng và trở về lịch ngày thành công.
- Kiểm thử tự động bổ sung: đủ 7 ngày, đúng người đã chọn, tổng kết dùng disclosure. Bộ smoke vẫn PASS.
- Chưa thử trên iPhone/Safari thật, VoiceOver hoặc bàn phím iOS. Không coi khung 375px là mô phỏng chính xác phần cứng iPhone 17.

## Đã chạy

- `node tests/smoke.cjs`: PASS. Cú pháp JavaScript; kho dữ liệu thật/mẫu tách biệt; 18 nhân viên mẫu, 126 ô lịch; tìm tên không dấu; đọc CSV có dấu phẩy trong tên; lưu ca và giữ cờ ghim; nội dung thuật toán tự xếp giống HEAD gốc; CSS/JS có trong danh sách offline.
- `git diff --check`: PASS.
- Trình duyệt local: xem ngày, chuyển sang bảng nhân viên, mở ô chỉnh ca và đóng; tìm “minh anh” trả đúng Minh Anh; cài đặt có 7 nhóm và 8 ô định mức; thêm “Nhân viên kiểm thử” vào bản mẫu, tải lại vẫn còn (bản mẫu sau test có 19 người).
- Xem giao diện sáng và tối; kiểm tra khung 1440px và 375px bằng trang preview. Bề rộng nội dung không vượt bề rộng khả dụng ở hai khung; bảng lịch nhỏ cuộn bên trong.
- Các màn trực tiếp đã kiểm tra không có lỗi JavaScript trong log tại thời điểm kiểm tra.

## Chưa kiểm định đầy đủ

- Không đồng bộ Google Sheet thật hay thay đổi dữ liệu quán để thử nghiệm.
- Chưa kiểm tra toàn bộ luồng xuất ảnh/chia sẻ Zalo, khôi phục file, tình huống mất mạng thật và mọi ràng buộc thuật toán.
- Chưa kiểm tra bằng screen reader thực hoặc trên thiết bị iPhone/Android thật. CSS có reduced-motion, nhưng chưa giả lập tuỳ chọn hệ thống này trong trình duyệt kiểm thử.
- API đổi viewport của khung trình duyệt không ổn định; kiểm tra kích thước dùng iframe trong preview.html. Các thao tác lưu dữ liệu được kiểm tra ở tab trực tiếp.
