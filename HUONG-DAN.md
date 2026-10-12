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

## C. Đăng bài hằng ngày
1. Vào **app.pagescms.org** → đăng nhập GitHub → chọn repo `truefit`.
2. Chọn mục: **Sản phẩm / Khách hàng & dự án / Tin tức / Chính sách / Trang chủ**.
3. **Add an entry** → điền form, tải ảnh → **Save**. Web tự cập nhật sau 1–2 phút.

Mẹo:
- Sản phẩm: chọn danh mục *Merchandise* hoặc *Đồng phục*; "Thứ tự" số nhỏ hiện trước (6 sản phẩm đầu mỗi loại hiện ở trang chủ).
- Ảnh thực tế: thêm vào ô "Ảnh thực tế" → hiện thành lưới ảnh dưới trang sản phẩm/dự án.
- Tiêu đề trang chủ: chữ nào muốn tô cam thì bọc trong `<span>…</span>`.
- Nén ảnh trước khi tải (dưới ~500KB/ảnh) để web nhanh – dùng squoosh.app.
