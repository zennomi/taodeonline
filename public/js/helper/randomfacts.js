const randomFacts = [
    "Ít cô gái có thể lọt vào mắt thầy Long Híp...",
    "Nếu là một máy ghim, thầy Nam chỉ là máy ghim vô dụng :))",
    "Thưa thầy Quý tăng lương anh Đăng Anh để web load nhanh hơn.",
    "Nhận thông báo đề thi thử mới tại <a href='https://www.facebook.com/HocLyThayQuy/' target='_blank'> fanpage</a> nhó.",
    "Nếu các bạn đang cày đề đêm thì có thể bật chế độ dark mode để đỡ mỏi mắt",
    "Bản cập nhật ngày 23/6 sửa rất chi là nhiều lỗii",
    "Chủ động lựa chọn độ khó dễ, thời gian làm đề khi chọn đề của các khoá luyện đề tại <a href='https://www.facebook.com/HocLyThayQuy/' target='_blank'>đây</a>.",
    "Bộ 20 đề trên web Luyện đề full lời giải chi tiết sẽ được công khai bán tròn 30 ngày trước thi tại <a href='/courses/60b1f2438d326938745bb8a0/view' target='_blank'>đây</a> nhaa.",
    "Một buổi chiều nọ nghe tin web bị sập, người lập trình web đã trầm ngâm suốt 30 phút đồng hồ",
    "Quên lamdevlsn đi vì giờ chúng ta đã có lamdevlsnzzzzzz"
]

const getRandomFacts = () => {
    return randomFacts[Math.floor(Math.random() * 1000) % (randomFacts.length)]
}