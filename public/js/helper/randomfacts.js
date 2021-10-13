const randomFacts = [
    "Ít cô gái có thể lọt vào mắt thầy Long Híp...",
    "Nếu là một máy ghim, thầy Nam chỉ là máy ghim vô dụng :))",
    "Thưa thầy Quý tăng lương anh Đăng Anh để web load nhanh hơn.",
    "Nhận thông báo đề thi thử mới tại <a href='https://www.facebook.com/HocLyThayQuy/' target='_blank'> fanpage</a> nhó.",
    "Nếu các bạn đang cày đề đêm thì có thể bật chế độ dark mode để đỡ mỏi mắt",
    "Cảm ơn em zai Minh Đức đẹp trai của anh đã giúp anh sửa lỗi web <i class='fas fa-heart'></i> ngày 24/6",
    "Chủ động lựa chọn độ khó dễ, thời gian làm đề khi chọn đề của các khoá luyện đề tại <a href='/courses' target='_blank'>đây</a>.",
    "Một buổi chiều nọ nghe tin web bị sập, người lập trình web đã trầm ngâm suốt 30 phút đồng hồ",
    '<div class="sans-serif">Giải mọi bài tập Lý miễn phí tại group <a class="btn btn-primary btn-sm btn-icon" href="https://www.facebook.com/groups/giaimoibaily" target="_blank"><i class="fab fa-facebook"></i><span>Ở đây giải mọi bài tập Lý</span></a></div>',
    '<div class="sans-serif">Tài liệu kèm video chữa chi tiết ôn thi giữa kỳ tại group <a class="btn btn-primary btn-sm btn-icon" href="https://www.facebook.com/groups/giaimoibaily" target="_blank"><i class="fab fa-facebook"></i><span>Ở đây giải mọi bài tập Lý</span></a></div>',
]

const getRandomFacts = () => {
    return randomFacts[Math.floor(Math.random() * 1000) % (randomFacts.length)]
}