const randomFacts = [
    "Thầy Longg Híp đang tìm real love...",
    "Thầy Móm đã từng móm thật =))",
    "Nếu là một máy ghim, thầy Nam chỉ là máy ghim vô dụng :)))))",
    "Thầy Hiếu chưa có ngừi iu nên khó mà cao thêm được.",
    "Thầy Quý hay nói rằng đàn ông nên có cửa phụ, nhưng thầy khá là sợ cửa chính.",
    "Thưa thầy Quý tăng lương anh Đăng Anh để web load nhanh hơn.",
    "Nếu Ngọc Linh chỉ là tên con gái thì chúng ta đã có một chị trợ giảng nữ.",
    "Anh Phạm Long ít nói, lạnh lùng và cực thuỷ chung.",
    "Thầy Dũng được học sinh gọi là Chichan nhưng thực ra nguồn gốc là Titan. Là bởi vì ơ dài quá thôi hỏi thẳng thầy Dũng nhé =))",
    "Đã từ rất lâu rồi không có trợ giảng nữ :((",
    "Dạo này tương tác fanpage a đuồi quá, mấy bạn vào kéo tương tác cho fanpage đuyyy. <a href='https://www.facebook.com/HocLyThayQuy/' target='_blank'>Link fanpage</a>.",
    "Nhận thông báo đề thi thử mới tại <a href='https://www.facebook.com/HocLyThayQuy/' target='_blank'> fanpage</a> nhó."
]

const getRandomFacts = () => {
    return randomFacts[Math.floor(Math.random()*1000)%(randomFacts.length)]
}