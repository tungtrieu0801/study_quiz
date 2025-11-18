# STUDY QUIZ APP PROJECT

This is open source FE web for study

Tech using:
- npm version: 11.6.2
- node version: v24.11.1
- vite version: vite/7.2.2 win32-x64 node-v24.11.1
- react: ^19.2.0

## Feature:
- auth/
- question-bank/ Giáo viên
- exam-management/Giáo viên
  ├── class-management/ Giáo viên
  ├── test-list/ Học sinh
  ├── exam-taking/Học sinh
  ├── student-history/Học sinh
  ├── dashboard/Chung
  └── analytics/Giáo viên

## Name convention
Quy tắc,Ví dụ,Mục đích
PascalCase,"UserProfile.jsx, LoginForm.jsx, Header.jsx",Bắt đầu bằng chữ cái hoa và viết hoa chữ cái đầu của mỗi từ.
Gắn liền với Tên Component,Tên file phải khớp chính xác với tên component được export (ví dụ: file Button.jsx chứa export default function Button() { ... }).,Giúp dễ dàng tìm thấy định nghĩa của một component.
Sử dụng Từ đơn giản,"Tránh dùng ký tự đặc biệt, dấu gạch ngang (-), hoặc khoảng trắng.",Tránh lỗi hệ thống tập tin và lỗi import.
Quy tắc,Ví dụ,Mục đích
camelCase,"useAuth.js, formatDate.js, authApi.js",Bắt đầu bằng chữ cái thường và viết hoa chữ cái đầu của các từ tiếp theo.
Phản ánh Vai trò,Thêm tiền tố/hậu tố để chỉ rõ mục đích của file.,Giúp phân biệt ngay lập tức chức năng của file.
Vai trò,Quy tắc đặt tên,Ví dụ
Custom Hooks,Bắt đầu bằng use và dùng camelCase.,"useLogin.js, useDebounce.js"
Zustand Stores,Bắt đầu bằng use và kết thúc bằng Store.,"useAuthStore.js, useCartStore.js"
Hàm API,Kết thúc bằng Api hoặc Service.,"authApi.js, productService.js"
Routes/Pages,Dùng PascalCase và kết thúc bằng Page.,"LoginPage.jsx, HomePage.jsx"
Hàm Tiện ích,Dùng camelCase và phản ánh hành động.,"formatTime.js, calculateScore.js"