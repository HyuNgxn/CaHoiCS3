# Lịch bơi — Ver 2.0

## Kết nối Cloudflare (bản hiện hành)

Nút Gửi lịch dùng Worker `https://lich-boi-api.huydang-work1.workers.dev`. Bản thật nhập MANAGER_KEY một lần; sau khi lấy link hoặc gửi thành công, mã được giữ trong localStorage của đúng trình duyệt/địa chỉ đó. Không có mã trong repo hoặc file sao lưu lịch. Dùng Đổi / quên mã để gỡ khỏi thiết bị; muốn thu hồi mã đã lộ phải thay secret trên Cloudflare. Không dùng trên thiết bị chung. Ai đọc được dữ liệu trình duyệt quản lý có thể lấy quyền gửi.

Nhân viên dùng link chung ở cùng website, chọn tên/tuần; nút tải lại lấy tuần mới nhất. Không gửi lương hoặc số điện thoại. Tải khi mở, quay lại trang hoặc bấm refresh, không polling mỗi phút. Bản mẫu không được gửi Cloudflare thật; vẫn cho thử link snapshot không cần server. Giữ nguyên tên miền và đường dẫn app cũ khi triển khai để dữ liệu quản lý vẫn ở cùng kho trình duyệt.

Ver 2.0 đổi tên ứng dụng, giữ thương hiệu Tiệm Cà Phê Cá Hồi ở đầu trang và giữ nguyên kho dữ liệu `xepca_v1`. Ba ô chuyển chế độ, một menu thao tác. Tiêu đề ca được thiết kế lại với tên ca + thời lượng và giờ bắt đầu/kết thúc định dạng 24 giờ. Tên ứng dụng trong manifest và thông tin màn hình chính là Lịch bơi. Biểu tượng đã thêm trước đây trên iPhone có thể vẫn giữ tên cũ do iOS; không xóa dữ liệu Safari để đổi tên.

Đây là bản local đã chỉnh; chưa tự triển khai GitHub Pages hoặc hosting máy chủ chia sẻ.

## Trang nhân viên / bản giao diện mới

Đã thêm giao diện ngà/be theo ảnh Journey, nút bo tròn, thanh điều hướng nổi và trang nhân viên riêng chỉ đọc. Máy chủ chia sẻ lịch cần chạy bằng Node (`server.cjs`), không phải Python static server. Xem [SHARING.md](SHARING.md) để cài mã quản lý, gửi lịch, tạo link riêng và triển khai HTTPS. Hiện mới có bản local; chưa triển khai Internet.

Ứng dụng web tĩnh quản lý ca, nhân viên, ngày nghỉ và lương dự kiến. Không cần cài thư viện để chạy.

## Mở trên máy

### Lưu lịch sử từng tuần

Lịch lưu ngay sau mỗi lần xếp/sửa, tách theo ngày thứ Hai của tuần. Đổi nội dung bảng đăng ký không xóa lịch trong ứng dụng; bấm lùi tuần để xem bản đã lưu mới nhất. Khi xếp lại một tuần đã có lịch từ đăng ký mới, ứng dụng hỏi xác nhận đúng khoảng ngày trước khi thay thế.

Sau 24 giờ không sửa lịch, tuần được đánh dấu đã chốt. Nếu đóng ứng dụng, trạng thái được kiểm tra bù lúc mở lại; dữ liệu đã lưu từ trước nên không cần giữ app chạy. Sửa tiếp một tuần sẽ lưu bản mới và tính lại 24 giờ. Xem trạng thái trong Tổng kết tuần. Chốt không khóa việc sửa tay.

Lịch sử và bản chụp dữ liệu theo tuần nằm cùng file sao lưu. Đây là lưu trong trình duyệt, không phải máy chủ: xóa dữ liệu Safari, gỡ dữ liệu ứng dụng, đổi máy hoặc đổi địa chỉ truy cập có thể làm không thấy dữ liệu. Vẫn nên xuất sao lưu định kỳ. Bản chụp kèm danh sách nhân viên/khung giờ dùng để giữ thông tin tại lúc lưu; đây chưa phải chức năng khôi phục nhiều phiên bản hay chống mọi thao tác xóa nhân viên.

Mở terminal tại thư mục này và chạy:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

- Bản sử dụng: http://127.0.0.1:4173/
- Bản xem thử: http://127.0.0.1:4173/?demo=1
- Khung xem desktop/tablet/điện thoại: http://127.0.0.1:4173/preview.html

Bản xem thử dùng nhân viên và lịch minh hoạ, được lưu riêng tại `xepca_ui_demo_v1`. Bản sử dụng giữ nguyên kho `xepca_v1`. Chỉnh sửa bản mẫu không ảnh hưởng bản sử dụng. Đây không phải dữ liệu nhân sự của quán. Lịch mẫu minh hoạ giao diện, không phải kết quả kiểm định thuật toán xếp ca.

Dữ liệu nằm trong trình duyệt và theo địa chỉ truy cập. Dữ liệu trên GitHub Pages hoặc thiết bị khác không tự xuất hiện trên localhost. Dùng **Cài đặt → Xuất file sao lưu / Khôi phục** để chuyển dữ liệu. Khôi phục thay thế dữ liệu của bản đang mở sau khi xác nhận.

## Bản UI/UX local

Bản tối giản theo ảnh tham khảo: thẻ vàng hiển thị số người có ca trong ngày đang chọn, nền trắng và danh sách ca phẳng. Điều hướng chỉ còn **Lịch làm · Nhân viên · Thêm**. “Xếp lịch” tập trung luồng lấy đăng ký/kiểm tra/xếp ca và lựa chọn xếp tay; nhập CSV/chép tuần nằm trong “Cách khác”. Cài đặt mở theo từng nhóm.

Không cần nhập đơn nghỉ mới: quản lý sửa trực tiếp ca khi nhận thông báo. Đơn cũ không bị xóa và vẫn ảnh hưởng cảnh báo/ràng buộc như trước; nếu đã có dữ liệu cũ, truy cập tại **Thêm → Đơn nghỉ / về sớm đã lưu trước đây** để xem hoặc điều chỉnh. Ứng dụng không tự đọc tin nhắn báo nghỉ.

Ưu tiên iPhone: lịch xuất hiện trước, tổng kết tuần thu gọn ở cuối; chữ tên nhân viên lớn hơn, bớt khoảng trống; lịch từng người hiển thị 7 ngày theo chiều dọc. Trang preview mở mặc định ở chế độ điện thoại. Dùng nút “Thêm” cạnh tuần để xem các thao tác ít dùng.

- Thanh bên trên desktop, thanh dưới với 5 mục trên điện thoại.
- Tổng hợp tuần, thẻ ca theo buổi, bảng nhân viên × 7 ngày có thể chọn ô để chỉnh sửa.
- Tìm nhân viên không dấu, lọc vị trí, thẻ giờ công.
- Hộp chỉnh sửa bên phải trên desktop và từ dưới lên trên điện thoại; hỗ trợ Escape, giữ focus và nhãn trường nhập.
- Cài đặt chia nhóm, giao diện sáng/tối theo hệ thống, chế độ giảm chuyển động.
- Giữ thuật toán xếp ca, Google Sheet/CSV, ghim ca, nghỉ/về sớm, xuất ảnh và sao lưu.
- Google Sheet chỉ được đọc khi người dùng bấm đồng bộ. Cần mạng và quyền xem công khai. Đồng bộ lấy đăng ký rồi xếp lịch; kiểm tra xác nhận trong ứng dụng trước khi thay lịch.

`index.html` chứa logic gốc và các màn hình; `ui.css` là hệ giao diện mới; `ui.js` chứa phần trình bày, hỗ trợ truy cập và dữ liệu mẫu. `sw.js` lưu tài nguyên để hoạt động offline sau lần mở đầu.

## Phạm vi và hướng cải thiện tiếp

Kiểm tra nhanh không cần cài thư viện: `node tests/smoke.cjs`. Kiểm tra cú pháp, lưu dữ liệu tách biệt, bảng lịch, tìm kiếm, CSV, chỉnh ca, thuật toán gốc không đổi và danh sách tài nguyên offline. Đây không phải bộ kiểm định đầy đủ độ công bằng của thuật toán.

Chưa có máy chủ, tài khoản, phân quyền hoặc đồng bộ nhiều thiết bị. Lương là dự kiến theo ca, chưa phải chấm công thực tế và chưa trừ về sớm. Nên bổ sung kiểm thử thuật toán và kiểm tra cấu trúc file sao lưu chặt hơn trước khi dùng với dữ liệu lớn. Không nâng framework hoặc thêm thư viện ngoài cho lần làm lại giao diện này.
