# Trang nhân viên và máy chủ chia sẻ

## Link ngắn cố định /lich

Worker bản mới có GET /lich chuyển hướng tới VIEWER_URL (mặc định https://hyungxn.github.io/CaHoiCS3/employee.html) với khóa đọc lịch chung. Link để gửi nhóm là https://lich-boi-api.huydang-work1.workers.dev/lich. Sau khi mở, thanh địa chỉ sẽ chuyển sang URL trang xem dài hơn; đây là link chia sẻ ngắn, không phải dịch vụ che URL đích. Endpoint /lich công khai: bất kỳ ai biết/đoán link này đều lấy được quyền đọc lịch cả đội. MANAGER_KEY vẫn cần thiết cho ghi lịch. Không gửi thông tin nhạy cảm vào lịch công bố.

Cần deploy lại cloudflare-worker.js và xuất bản employee.html phiên bản kết nối Cloudflare lên GitHub Pages trước khi link hoạt động đầy đủ. Code local thay đổi không tự cập nhật Worker hay GitHub. Nếu dùng site đích khác, cấu hình biến Text VIEWER_URL là HTTPS URL của employee.html đó; không thay tên miền quản lý đang dùng.

## Bản thử local không cần máy chủ lưu lịch (mới nhất)

Nút Gửi lịch hiện mở **Chia sẻ lịch tương tác**. Tạo link `employee.html#snapshot=...` chứa một tuần lịch đã rút gọn, không gọi API và không cần mã quản lý. Người xem chọn tên; không thể chỉnh qua UI. Không gửi lương/số điện thoại/đăng ký rảnh. Mỗi lần đổi lịch phải chia sẻ link mới; link cũ bất biến, không có nút refresh nhận dữ liệu mới. Link không mã hóa, không ký xác thực; ai có link có thể đọc và người có kỹ năng có thể tạo nội dung link khác.

Chỉ cần phục vụ HTML/JS/CSS tĩnh; không cần Node API cho chế độ này. Localhost chỉ xem trên máy tính; muốn xem qua Wi-Fi phải mở app quản lý từ địa chỉ LAN rồi tạo link, hoặc triển khai các file tĩnh lên HTTPS cùng đường dẫn. Link tạo bằng đường dẫn tương đối nên hỗ trợ GitHub Pages dưới thư mục repo. Chưa triển khai công khai.

Giới hạn payload 16.000 ký tự, đây là giới hạn phòng ngừa chứ không đảm bảo mọi ứng dụng chat chấp nhận. Cần thử gửi thực tế qua Zalo/Safari trước khi dùng thật. Phần máy chủ và link chung cố định dưới đây vẫn giữ làm phương án khác nhưng không phải luồng mặc định của bản thử này.

## Cập nhật: dùng một link chung cố định

Luồng hiện tại thay thế hướng link riêng mô tả bên dưới: quản lý chọn **Lấy link chung cho cả đội**, sao chép một lần và gửi nhóm. Nhân viên chọn tên và tuần trong cùng trang chỉ đọc. Ai có link xem được lịch mọi người; lương, số điện thoại và ghi chú riêng vẫn không được công bố. API link riêng cũ được giữ tương thích nhưng không còn là luồng quản lý chính.

Link chung lưu trong published.json, không thay khi gửi tuần mới, gửi lại tuần cũ, restart server hay đổi mã quản lý. Phải giữ file dữ liệu này và cùng tên miền khi chuyển hosting để giữ nguyên URL; không thể đảm bảo link tồn tại nếu xóa dữ liệu hoặc bỏ tên miền. Nút ↻ tải lại từ máy chủ và chuyển tới tuần có ngày bắt đầu mới nhất đã gửi, giữ người đang chọn nếu người đó có trong tuần. Các lần tự tải nền không ép chuyển tuần người dùng đang đọc. Lịch nháp của quản lý không tự xuất hiện; phải xác nhận gửi.

## Trạng thái

Đã triển khai máy chủ local, trang nhân viên và nút gửi lịch. Chưa triển khai hosting Internet, chưa có tên miền/HTTPS và chưa gửi tin nhắn đến nhân viên thật.

File [cloudflare-worker.js](cloudflare-worker.js) là bản Worker hoàn chỉnh cho Cloudflare: dùng binding `DB`, secret `MANAGER_KEY`, tự tạo/kiểm tra bảng, ghi đè đúng tuần, giữ lịch cũ, link chung cố định và API đọc lịch cả đội. Worker không phục vụ giao diện; GitHub Pages tiếp tục phục vụ HTML/CSS/JS.

## Chạy trên máy tính

Trong thư mục repo:

```powershell
node server.cjs
```

Mở `http://127.0.0.1:4180/` cho quản lý. Máy chủ chỉ nghe localhost mặc định. Muốn dùng Wi-Fi phải cấu hình HOST là địa chỉ LAN phù hợp, cho phép cổng trên mạng riêng và dùng cùng địa chỉ đó trên cả quản lý và nhân viên. Không dùng HTTP LAN cho dữ liệu thật trên mạng không tin cậy.

Server lần đầu tạo `manager-key.txt` trong `%LOCALAPPDATA%/CaHoiCS3-server` trên Windows (hoặc thư mục home/CaHoiCS3-server khi không có LOCALAPPDATA). Đây là mã quản lý bí mật, dùng để nhập vào hộp Gửi lịch. Không gửi mã cho nhân viên. Dữ liệu máy chủ nằm ngoài thư mục web. Để thay mã quản lý: dừng máy chủ, đặt biến `CAHOI_MANAGER_KEY` với mã ngẫu nhiên đủ mạnh (ít nhất 32 ký tự), khởi động lại và dùng mã mới.

**Địa chỉ mới có kho dữ liệu trình duyệt riêng.** Nếu đã dùng bản ở cổng 4173/4174, xuất sao lưu tại bản đó rồi khôi phục ở địa chỉ 4180 trước khi dùng dữ liệu thật. Không tự chuyển dữ liệu qua các địa chỉ. Bản mẫu dùng `?demo=1` vẫn tách khỏi bản thật.

## Quy trình quản lý

1. Xếp lịch trong bản quản lý, kiểm tra tuần đang chọn.
2. Chọn Thêm → Gửi lịch cho nhân viên (hoặc Xếp lịch → Đã xếp xong → Gửi cho nhân viên).
3. Nhập mã quản lý, xác nhận gửi đúng tuần.
4. Sao chép link riêng và gửi cho từng nhân viên qua kênh bạn chọn. Ứng dụng không tự gửi Zalo/SMS.
5. Chỉnh lịch nháp không đổi trang nhân viên. Muốn cập nhật phải xác nhận gửi lại tuần đó.

Link nhân viên ổn định qua các lần gửi. Máy chủ trả link mới lần đầu; máy quản lý giữ bản sao link riêng trong localStorage. Nếu mất link ở máy quản lý, chọn Tạo lại link; link cũ bị vô hiệu. Đổi link cũng thu hồi link cũ khi bị lộ. Người đã chụp màn hình hay sao chép nội dung trước đó vẫn giữ được bản đó.

## Trang nhân viên

`/employee.html#<mã-ngẫu-nhiên>`: chỉ trả về tên và lịch của đúng người có mã. Không nhận employeeId từ client để chọn người khác. Có chọn tuần, tuần trước/sau, thời điểm cập nhật và tải lại. Ưu tiên tuần hiện tại; nếu chưa có, hiển thị thông báo và tuần đã gửi gần nhất. Không có sửa, lương, số điện thoại, lý do nghỉ hay đăng ký rảnh. Mỗi phút khi trang đang mở, hoặc khi trở lại trang, tải lại lịch. Mất mạng hiển thị lỗi và ẩn lịch cũ để không khiến nhân viên tưởng đã cập nhật.

**Đây là link bí mật (bearer link), không phải đăng nhập xác thực danh tính.** Ai có link xem được lịch người đó. Chỉ chia sẻ riêng. Nếu cần bảo mật theo tài khoản, cần bổ sung đăng nhập/OTP.

## Triển khai lâu dài

Cần máy chủ Node.js có ổ đĩa bền vững và HTTPS qua reverse proxy. Đặt `CAHOI_DATA_DIR` ngoài thư mục web, `CAHOI_MANAGER_KEY` trong secret của hosting, `HOST`/`PORT` theo hosting. Chỉ chạy một tiến trình/instance: bản này lưu JSON nguyên tử, không dành cho nhiều instance hay serverless filesystem tạm. Backup cả file published.json và secret quản lý qua kênh bảo mật. Không dùng máy chủ static Python để phục vụ thư mục repo sau khi có dữ liệu máy chủ: Python có thể cho tải `.server-data/` qua URL đoán được. Luôn dùng server.cjs với danh sách file cho phép, hoặc đặt CAHOI_DATA_DIR ngoài thư mục được phục vụ.

Máy quản lý có thể tắt sau khi gửi **nếu máy chủ hosting vẫn chạy**. Với server chạy trên máy tính cá nhân, tắt máy/dừng server thì nhân viên không tải lịch được. GitHub Pages thuần tĩnh không chạy được API này.

Chưa có sao lưu cloud tự động, nhiều chi nhánh, đăng nhập nhân viên, notification push hay nhật ký nhiều phiên bản. Lịch đã công bố giữ từng tuần; gửi lại thay bản của đúng tuần đó.

## Kiểm thử

`node scripts/start-demo.cjs` mở máy chủ mẫu tại localhost:4180 với nhân viên hư cấu. Dữ liệu và mã demo nằm riêng trong `%LOCALAPPDATA%/CaHoiCS3-preview`. Console chỉ in link nhân viên mẫu, không in mã quản lý. Dừng bản mẫu trước khi chạy server thật trên cùng cổng.

`node tests/publishing.cjs` kiểm tra quyền, lọc thông tin riêng, link riêng, đổi link, giữ tuần cũ, lịch nháp không công bố, phục hồi sau restart và chặn file nội bộ.
