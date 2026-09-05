# Cá Hồi workspace

## Lịch bơi — Ver 2.0

Tên quán là nhận diện chính (18px trên điện thoại), tiêu đề vùng giảm còn 17px để không lấn át. Bỏ dòng cơ sở lặp dưới tiêu đề. Thẻ ca dùng hai hàng cân đối: tên buổi + thời lượng, khoảng giờ 24h + số người. Tên nhân viên 15px; label 13–14px; ghi chú 12px; ô nhập 16px. Tông nền ngà/be, ba chế độ và menu thao tác giữ nguyên. Ưu tiên chức năng hơn trang trí, không đổi cấu trúc dữ liệu.

### Tinh gọn v31

Ba ô trên cùng là điều hướng chế độ, không còn số liệu trang trí. Bỏ thanh tab lặp; một nút Thao tác cạnh tiêu đề mở ba hành động. Tổng kết có nội dung riêng và giữ bộ chuyển tuần. Giảm font-weight và nền phụ của bộ chọn ngày, bỏ vòng nền icon ca để bớt nhiều lớp thẻ. Không hạ tương phản chữ nhằm mô phỏng ảnh mờ.

## Tham khảo mới nhất: Journey

Thay thẻ vàng bằng ba ô số liệu thật của ngày đang chọn (người, lượt ca, giờ). Nền ngà #f4f1eb, thẻ #fffdf8, điểm nhấn be #d7c4a5, chữ #3b3933 và chữ phụ #716b60. Thanh điều hướng nổi dạng viên, ba mục. Giữ chữ rõ hơn ảnh mẫu, không thêm biểu đồ thiếu mục đích. Trang nhân viên dùng cùng tông nền và thẻ, nhưng không có bất kỳ điều khiển sửa hay chức năng quản lý.

## Hướng cuối theo ảnh tham khảo của người dùng

Ưu tiên iPhone và người không rành công nghệ. Nền trắng, thẻ vàng #f3c442, chữ #282820, chữ phụ #706f65, đường phân cách #e8e8df, vùng nhấn nhạt #fff6dc. Font hệ thống iPhone cho cả nhãn và nội dung, phân cấp bằng cỡ/độ đậm. Không mô phỏng Dynamic Island hoặc thanh trạng thái trong ứng dụng thật. Thẻ nổi bật hiển thị thông tin ca thực, không số trang trí. Chỉ 3 điểm đến chính; chức năng ít dùng mở theo yêu cầu. Đây là thay thế hướng desktop ưu tiên ở bản đầu.

Giao diện dành cho người quản lý quán: công việc chính là đọc và điều chỉnh phân công, không phải trang giới thiệu quán.

## Quyết định thiết kế

- Mực xanh `#202e40`: chữ và thanh điều hướng; cá hồi `#bd493b`: hành động chính; nền `#f5f6f8`; mặt thẻ `#ffffff`; nét phân cách `#e4e8ee`; chữ phụ `#657184`.
- Tiêu đề dùng Bahnschrift nếu có trên Windows, dự phòng Segoe UI. Nội dung Segoe UI/system-ui. Không phụ thuộc tải font ngoài để giữ offline.
- Desktop: thanh bên 248px, tiêu đề trang, tổng hợp tuần, bảng lịch. Tablet/điện thoại: điều hướng dưới, tổng hợp 2 cột, thẻ ca 1 cột.
- Dấu hiệu riêng là dải 7 ngày kiểu lịch bàn, ngày đang chọn có đường viền và vạch cá hồi. Các buổi có tên và biểu tượng, không dùng riêng màu để phân biệt.
- Không thêm ảnh trang trí hoặc biểu đồ khi số liệu ngắn dễ đọc hơn.

## Sử dụng skill

UI UX Pro Max được cài từ nextlevelbuilder/ui-ux-pro-max-skill, đi kèm frontend-design. Đã đọc SKILL.md, quick-reference.md, pro-rules.md và chạy design-system cho “staff scheduling dashboard cafe”, sau đó thu hẹp “workforce management dashboard”. Kết quả pha trộn gợi ý marketing/học thuật không được áp dụng như đặc tả. Hướng thiết kế là lựa chọn riêng phù hợp quán; các nguyên tắc navigation adaptive, focus, nhãn, reduced motion và semantic color được áp dụng từ skill.
