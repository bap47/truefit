# TrueFit – Hướng dẫn đưa web lên (miễn phí)

## A. Đưa lên GitHub Pages (làm 1 lần)
1. Tạo tài khoản tại github.com.
2. Bấm **New repository** → đặt tên `truefit` → Public → Create.
3. Bấm **uploading an existing file** → kéo **toàn bộ nội dung bên trong** thư mục này vào (không kéo cái thư mục ngoài cùng) → **Commit changes**.
   - Lưu ý: file `.pages.yml` bắt đầu bằng dấu chấm có thể bị ẩn trên máy. Mac: bấm Cmd+Shift+. để hiện. Windows: View → Hidden items.
4. Vào **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
5. Chờ 1–2 phút, web chạy ở `https://<tentaikhoan>.github.io/truefit/`.
   - Trong lúc chưa gắn tên miền: mở `_config.yml`, sửa `baseurl: ""` thành `baseurl: "/truefit"` để ảnh và link chạy đúng.

## B. Gắn tên miền truefituniform.shop (khi sếp duyệt)
1. Settings → Pages → Custom domain → nhập `truefituniform.shop` → Save → tick **Enforce HTTPS**.
2. Đổi lại `baseurl: ""` trong `_config.yml`.
3. Người quản lý tên miền vào DNS, thêm 4 bản ghi **A** cho `@`: 185.199.108.153 · 185.199.109.153 · 185.199.110.153 · 185.199.111.153, và 1 bản ghi **CNAME** `www` → `<tentaikhoan>.github.io`.

## C. Sửa nội dung (app.pagescms.org → repo `truefit`)
Menu CMS chia 3 nhóm:

**⚙️ Cài đặt chung – sửa 1 chỗ, cả web cập nhật**
| Muốn đổi | Sửa ở | Tự cập nhật ở |
|---|---|---|
| Thanh ưu đãi, slogan, giới thiệu ngắn | ⚙️ Thông tin chung | Dải trên cùng, footer – mọi trang |
| Ưu đãi nổi bật (Thiết kế miễn phí…) | ⚙️ Thông tin chung | Menu sổ xuống Đồng phục / Quà tặng |
| Bảo hành, phí thiết kế, gia công logo | ⚙️ Thông tin chung | Bảng thông tin của mọi sản phẩm |
| Hotline, Zalo, email, giờ làm việc | ⚙️ Liên hệ | Nút gọi, nút Zalo, khối báo giá, footer, popup |
| Email nhận form báo giá | ⚙️ Liên hệ | Mọi form báo giá |
| Favicon, ảnh khi gửi link | ⚙️ Favicon & ảnh khi gửi link | Toàn web |

**Nội dung – thêm/sửa thường xuyên**
| Muốn đổi | Sửa ở | Tự cập nhật ở |
|---|---|---|
| Thêm/sửa sản phẩm | 📦 Sản phẩm | Menu, trang danh mục, tìm kiếm, «Được đặt nhiều nhất» (tick Bán chạy), «Sản phẩm cùng loại», số «tự động» ở trang chủ |
| Thêm/sửa đối tác | 🤝 Đối tác | Logo chạy ngang, đối tác tiêu biểu (tick Nổi bật), trang Đối tác, tìm kiếm |
| Các bước quy trình | 🔁 Quy trình đặt hàng | Trang chủ, trang quy trình, cuối mọi trang sản phẩm & đối tác |
| Chính sách | 📄 Chính sách | Menu, footer, tìm kiếm |

**🏠 Trang chủ** – xếp theo thứ tự từ trên xuống, chỉ chứa chữ/ảnh riêng của trang chủ.

Mẹo:
- Chữ muốn tô cam: bọc trong *dấu sao*. Tiêu đề banner: nhấn Enter để xuống dòng.
- Sản phẩm: «Ảnh chính» + «Ảnh thêm» → ảnh tự chạy 2 giây ở trang sản phẩm.
- Đối tác: «Sản phẩm đã làm» gõ đúng tên sản phẩm (VD: Áo Polo).
- Ô số liệu trang chủ: gõ «tự động» để tự đếm số sản phẩm.
- Nén ảnh dưới ~500KB/ảnh (squoosh.app) để web nhanh.
