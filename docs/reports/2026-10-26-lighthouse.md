# Lighthouse duypham.me: có nên optimize không? (2026-10-26)

## Kết luận

**Có, nhưng chỉ ở mức vừa phải.** Phần lớn điểm thấp trong 2 báo cáo không phải do code của site:

| Điểm bị trừ | Nguyên nhân thật | Ai sửa |
|---|---|---|
| Unused JS 789 KiB, Minify JS 231 KiB | 100% là `chrome-extension://` (Bitwarden và 2 extension khác). Site không gửi xuống byte nào trong số đó. Extension còn ăn thêm khoảng 575 ms main-thread trên mobile. | Không cần sửa. Đo lại bằng cửa sổ Ẩn danh. |
| Desktop Perf 70 | Mạng chậm trong lúc đo (TTFB 1.19 s, tải font mất 2.1 s), cộng thêm việc thang điểm desktop chấm gắt hơn: LCP 3.7 s ăn 0.21 điểm, còn mobile LCP 3.0 s ăn 0.79. Đo lại bằng headless Lighthouse 3 lần thì desktop ra **59 / 92 / 69**: nhiễu cỡ 30 điểm. | Không đáng đuổi theo con số. |
| Best Practices 77 | Chỉ có 2 audit fail, đều do Cloudflare chèn script: `deprecations` đến từ Bot Fight Mode / JS Detections (5/6 điểm bị mất), `errors-in-console` là beacon analytics bị ad blocker của bạn chặn. | **Bạn**, trên dashboard Cloudflare |
| LCP chờ font | Chữ hero là phần tử LCP. Chuỗi tải là document → CSS Google Fonts → woff2 90 KB, đi qua 3 origin. | **Đã sửa** trong PR #17 |
| `[email protected]` | Email Obfuscation của Cloudflare đổi mọi link mailto. Crawler, link preview và tool AI của recruiter chỉ thấy placeholder thay vì địa chỉ email, mà nút chính của portfolio lại là "Email me". | **Đã sửa** trong PR #17 |
| A11y 96 (desktop) | Link Live/GitHub chỉ cao 17 px (target-size). Ngoài ra aria-label của wordmark không khớp chữ hiển thị (lỗi này weight 0, không trừ điểm). | **Đã sửa** trong PR #17 |

## Đã làm (PR [#17](https://github.com/duypham9895/duys-portfolio/pull/17))

- Self-host Archivo và IBM Plex Mono: dùng đúng các file Google đang phục vụ, preload subset latin, cache `/fonts/` 1 năm, kèm file license OFL.
- Bọc `<body>` trong `<!--email_off-->`. Địa chỉ email vốn đã public trong JSON-LD, nên che đi cũng không bảo vệ được gì.
- Sửa aria-label wordmark thành `duypham.me, home`. Nâng `.plinks a` lên min-height 24 px. Trên desktop, khoảng cách giữa hai link đổi từ 6 px xuống 4 px; trên mobile, card cao thêm khoảng 7 px.
- Test: vitest 94/94 và e2e 39/39 pass. Có thêm `tests/unit/fonts.test.ts`.
- Review: một session Claude mới đọc diff. **Same vendor, same priors — no external verifier ran.** Kết quả 0 blocker; mục SHOULD-FIX (thiếu file license OFL) đã sửa.

## Việc của bạn (dashboard Cloudflare, token hiện chỉ có quyền đọc)

1. **Tắt Bot Fight Mode / JS Detections** (Security → Bots). Site portfolio tĩnh, không có form hay login, nên không có gì cần bảo vệ. Best Practices dự kiến lên khoảng 96, và 100 khi đo ở profile không có ad blocker. Script này cũng là resource lớn thứ 2 trên trang (12 KB, 3 request).
2. *(Tuỳ chọn)* Tắt hẳn Email Obfuscation (Scrape Shield). PR đã vô hiệu nó cho site, nhưng tắt hẳn thì gọn hơn.
3. **Giữ** Web Analytics beacon, vì nó là nguồn đếm referral cho `/in`, `/cv`, `/gh`. **Giữ** Speed Brain, vì nó chỉ tốn 1 request khoảng 500 B.

## Không đáng làm

- Đuổi theo điểm desktop 70. Số đo ngoài thực tế trên mobile đã tốt: FCP 0.8 s, LCP 1.0 s.
- Font metric override, cắt trục wdth (CSS dùng đủ dải 62–125%), tối ưu ảnh, unused CSS. Các audit này đều đã pass.
- Bỏ Cloudflare proxy (grey-cloud) để giảm TTFB. Đo từ mạng nhà quá nhiễu nên chưa kết luận được. Chỉ nên cân nhắc khi đo 10 mẫu từ một mạng ổn định thấy chênh lệch rõ.

## Cách đo lại cho đúng

Mở Chrome **Ẩn danh** (không extension), hoặc dùng PageSpeed Insights (hôm nay đã hết quota API). Chạy ít nhất 3 lần rồi lấy trung vị.
