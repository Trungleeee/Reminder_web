import { FaYoutube, FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

function Footer() {
  const socialIconsStyle = {
    fontSize: '24px',
    transition: '0.3s',
  };
  const socialData = [
    { icon: <FaFacebook />, color: '#1877F2', url: 'https://facebook.com' },
    { icon: <FaYoutube />, color: '#FF0000', url: 'https://youtube.com' },
    { icon: <FaInstagram />, color: '#E4405F', url: 'https://instagram.com' },
    { icon: <FaTiktok />, color: '#000000', url: 'https://tiktok.com' },
  ];

  const cols = [
    { title: 'Sản phẩm', links: ['Tính năng', 'Giá cả', 'Cập nhật mới', 'Lộ trình phát triển'] },
    { title: 'Hỗ trợ', links: ['Trung tâm trợ giúp', 'Cộng đồng', 'Blog', 'Liên hệ'] },
    { title: 'Công ty', links: ['Về chúng tôi', 'Tuyển dụng', 'Đối tác', 'Báo chí'] },
  ];

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">🌿 Reminder</div>
          <div className="footer-tagline">
            Là công cụ quản lý thời gian thông minh là trợ thủ đắc lực giúp bạn làm chủ cuộc sống, 
            tối ưu hóa năng suất và chinh phục mọi mục tiêu trên hành trình phát triển bản thân mỗi ngày.
          </div>
          <div className="footer-socials" style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
            {socialData.map((item, index) => (
              <a 
                key={index} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ ...socialIconsStyle, color: item.color, display: 'flex' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {cols.map((col, i) => (
          <div key={i}>
            <div className="footer-col-title">{col.title}</div>
            <div className="footer-links">
              {col.links.map((l, j) => <a href="/" key={j}>{l}</a>)}
            </div>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <div className="footer-copy">© 2026 Web Reminder. Bảo lưu mọi quyền.</div>
        <div className="footer-legal">
          <a href="/">Chính sách bảo mật</a>
          <a href="/">Điều khoản dịch vụ</a>
          <a href="/">Cookie</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;