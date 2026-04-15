import { useState, useEffect, useRef } from 'react';
import "./Home.css";

function useFadeUp() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ════════════════════════════════
// COMPONENT: Hero
// ════════════════════════════════
function Hero() {
  const [progWidth, setProgWidth] = useState('0%');

  useEffect(() => {
    const timer = setTimeout(() => setProgWidth('25%'), 400);
    return () => clearTimeout(timer);
  }, []);

  const tasks = [
    { done: true,  name: 'Kiểm tra email buổi sáng', tag: 'Xong',       tagClass: 'tag-gray'  },
    { done: false, name: 'Họp nhóm dự án · 09:00',  tag: 'Khẩn',       tagClass: 'tag-red'   },
    { done: false, name: 'Nộp báo cáo tháng 3',      tag: 'Quan trọng', tagClass: 'tag-amber' },
    { done: false, name: 'Tập thể dục · 17:30',      tag: 'Hôm nay',    tagClass: 'tag-green' },
  ];

  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-badge">
          <div className="badge-dot"></div>
          Công cụ quản lý thời gian
        </div>
        <h1 className="hero-h1">
          Chào mừng đến<br />
          <em>Web Reminder</em>
        </h1>
        <p className="hero-desc">
          Web Reminder là trợ lý kỹ thuật số giúp bạn quản lý nhiệm vụ thông minh
          và tối ưu hóa năng suất thông qua các phương pháp khoa học. Hãy để chúng
          tôi đồng hành cùng bạn trên hành trình làm chủ quỹ thời gian và chinh
          phục mọi mục tiêu mỗi ngày.
        </p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => window.location.href = "/sign_in"}>Bắt đầu ngay →</button>
          <button className="btn-ghost">Tìm hiểu thêm</button>
        </div>
        <div className="hero-social-proof">
          <div className="avatars">
            {['BN','TL','HM','+'].map((a, i) => (
              <div className="av" key={i}>{a}</div>
            ))}
          </div>
          <div className="proof-text">
            <strong>10,000+</strong> người dùng đã tin tưởng lựa chọn
          </div>
        </div>
      </div>

      <div className="hero-card">
        <div className="card-header">
          <div className="card-title">Nhiệm vụ hôm nay</div>
          <div className="card-date">CN, 22/03/2026</div>
        </div>
        {tasks.map((t, i) => (
          <div className="task-item" key={i}>
            <div className={`task-cb ${t.done ? 'done' : ''}`}>
              {t.done && <div className="ck"></div>}
            </div>
            <span className={`task-name ${t.done ? 'done' : ''}`}>{t.name}</span>
            <span className={`tag ${t.tagClass}`}>{t.tag}</span>
          </div>
        ))}
        <div className="prog-wrap">
          <div className="prog-meta">
            <span>Tiến độ hôm nay</span>
            <span>1 / 4 nhiệm vụ</span>
          </div>
          <div className="prog-track">
            <div className="prog-fill" style={{ width: progWidth }}></div>
          </div>
        </div>
        <div className="stats-row">
          {[['4','Nhiệm vụ'],['1','Đã xong'],['2','Khẩn cấp']].map(([n, l], i) => (
            <div className="stat" key={i}>
              <div className="stat-n">{n}</div>
              <div className="stat-l">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════
// COMPONENT: Features
// ════════════════════════════════
function Features() {
  const titleRef = useFadeUp();
  const subRef   = useFadeUp();

  const features = [
    { icon: '📋', title: 'Quản lý Nhiệm vụ',    delay: '0s',    desc: 'Tạo, phân loại theo dự án và theo dõi tiến độ công việc hàng ngày. Đảm bảo không bỏ sót bất kỳ thông tin quan trọng nào trong guồng quay bận rộn.' },
    { icon: '⚡', title: 'Ma trận Ưu tiên',      delay: '0.1s',  desc: 'Phân loại công việc theo 4 nhóm quan trọng và khẩn cấp của Eisenhower. Tập trung nguồn lực vào những việc thực sự tạo ra giá trị.' },
    { icon: '📅', title: 'Lịch trình Trực quan', delay: '0.2s',  desc: 'Bao quát quỹ thời gian qua giao diện lịch theo ngày, tuần hoặc tháng. Tránh tình trạng quá tải hoặc chồng chéo lịch trình không đáng có.' },
    { icon: '🎯', title: 'Đồng hồ Tập trung',   delay: '0.3s',  desc: 'Tối ưu hiệu suất bằng phương pháp Pomodoro kết hợp âm thanh thư giãn. Thống kê chi tiết giúp bạn đo lường tính kỷ luật và năng suất cá nhân.' },
  ];

  return (
    <section className="features-section" id="features">
      <div className="section-inner">
        <h2 className="section-h2 fade-up" ref={titleRef}>Mọi thứ bạn cần để làm việc hiệu quả</h2>
        <p className="section-sub fade-up" ref={subRef}>
          Được xây dựng dựa trên khoa học về năng suất, giúp bạn hoàn thành nhiều việc hơn trong ít thời gian hơn.
        </p>
        <div className="feat-grid">
          {features.map((f, i) => {
            const cardRef = useFadeUp(); // eslint-disable-line
            return (
              <div
                className="feat-card fade-up"
                key={i}
                style={{ transitionDelay: f.delay }}
                ref={cardRef}
              >
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════
// COMPONENT: CTA
// ════════════════════════════════
function CTA() {
  const boxRef = useFadeUp();
  const perks = [
    'Miễn phí mãi mãi với gói cơ bản',
    'Không giới hạn nhiệm vụ và dự án',
    'Đồng bộ trên mọi thiết bị',
  ];
  return (
    <section className="cta-section" id="cta">
      <div className="cta-box fade-up" ref={boxRef}>
        <div className="cta-left">
          <div className="cta-eyebrow">Đăng ký ngay hôm nay</div>
          <h2 className="cta-h2">Bắt đầu hành trình<br />làm chủ thời gian</h2>
          <p className="cta-desc">
            Miễn phí hoàn toàn. Không cần thẻ tín dụng. Bắt đầu trong 30 giây và
            khám phá sức mạnh của việc sống có kế hoạch.
          </p>
          <div className="cta-perks">
            {perks.map((p, i) => (
              <div className="cta-perk" key={i}>
                <div className="perk-check"><div className="pck"></div></div>
                {p}
              </div>
            ))}
          </div>
        </div>
        <div className="cta-right">
          <div className="cta-form">
            <input className="cta-input" type="text"  placeholder="Họ và tên của bạn" />
            <input className="cta-input" type="email" placeholder="Địa chỉ email của bạn" />
            <button className="cta-btn" onClick={() => window.location.href = "/sign_in"} >Đăng ký miễn phí →</button>
            <div className="cta-note">Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ của chúng tôi</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════
// COMPONENT: HowToUse
// ════════════════════════════════
function HowToUse() {
  const labelRef = useFadeUp();
  const titleRef = useFadeUp();
  const subRef   = useFadeUp();

  const steps = [
    { num: 1, title: 'Liệt kê nhiệm vụ',      delay: '0s',   desc: 'Đừng giữ trong đầu nữa, hãy tống khứ mọi đầu việc vào danh sách Task. Coi ghi ra đi, Web Reminder gánh hết!', quote: '"Não bạn để suy nghĩ, không phải để nhớ."' },
    { num: 2, title: 'Sắp hạng ưu tiên',      delay: '0.1s', desc: 'Ném chúng vào Ma trận Eisenhower. Cái nào Deadline "tử" thì cho vào ô "Làm ngay", cái nào lao thì tiến lên đường ngay và luôn.', quote: '"Không phải mọi việc đều khẩn cấp như bạn nghĩ."' },
    { num: 3, title: 'Lên lịch trình',         delay: '0.2s', desc: 'Kéo thả các nhiệm vụ vào Calendar như chốt xếp hình. Nhìn vào là biết lúc nào bận mặt, lúc nào được ranh rang đi trà sữa.', quote: '"Lên kế hoạch không phải để hạn chế, mà để tự do."' },
    { num: 4, title: 'Bật đồng hồ tập trung', delay: '0.3s', desc: 'Nhấn Timer, 25 phút tập trung cao độ, 5 phút nghỉ ngơi – giúp bạn hoàn thành việc nhanh đến mức chính bạn cũng phải ngạc nhiên!', quote: '"Làm ít hơn, đạt nhiều hơn với Pomodoro."' },
  ];

  return (
    <section className="how-section" id="how">
      <div className="section-inner">
        <div className="section-label fade-up" ref={labelRef}></div>
        <h2 className="section-h2 fade-up" ref={titleRef}>Cách dùng Web Reminder</h2>
        <p className="section-sub fade-up" ref={subRef} style={{ fontStyle: 'italic', color: '#4a7a44' }}>
          (Để Không Còn Là Con Nợ Thời Gian)
        </p>
        <div className="steps-grid">
          {steps.map((s, i) => {
            const stepRef = useFadeUp(); // eslint-disable-line
            return (
              <div
                className="step fade-up"
                key={i}
                style={{ transitionDelay: s.delay }}
                ref={stepRef}
              >
                <div className="step-num">{s.num}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
                <div className="step-quote">{s.quote}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════
// COMPONENT: Demo
// ════════════════════════════════
function Demo() {
  const titleRef   = useFadeUp();
  const subRef     = useFadeUp();
  const browserRef = useFadeUp();

  const summaryCards = [
    { n: '5',   l: 'Tổng nhiệm vụ'  },
    { n: '1',   l: 'Đã hoàn thành'  },
    { n: '2',   l: 'Khẩn cấp'       },
    { n: '20%', l: 'Tiến độ'        },
  ];
  const dbTasks = [
    { bar: '#e05050', name: 'Thanh toán hóa đơn điện', meta: 'Tài chính · Hết hạn hôm nay', badgeBg: '#fde8e8', badgeColor: '#c03030', badge: 'Khẩn cấp' },
    { bar: '#2d5a27', name: 'Họp nhóm dự án · 09:00',  meta: 'Công việc · Phòng họp A',      badgeBg: '#e0f2dc', badgeColor: '#2d6a27', badge: 'Hôm nay' },
    { bar: '#e9a020', name: 'Nộp báo cáo tháng 3',      meta: 'Công việc · Deadline: 14:00',  badgeBg: '#fef3d8', badgeColor: '#a06010', badge: 'Quan trọng' },
  ];

  return (
    <section className="demo-section" id="demo">
      <div className="section-label fade-up" ></div>
      <h2 className="section-h2 fade-up" ref={titleRef} style={{ marginBottom: '8px' }}>Giao diện đơn giản, dễ dùng</h2>
      <p className="section-sub fade-up" ref={subRef}>
        Thiết kế tập trung vào trải nghiệm người dùng, giúp bạn làm việc mà không bị phân tâm.
      </p>
      <div className="demo-browser fade-up" ref={browserRef}>
        <div className="browser-bar">
          <div className="bdot bdot-r"></div>
          <div className="bdot bdot-y"></div>
          <div className="bdot bdot-g"></div>
          <div className="url-bar">🔒 webreminder.vn/dashboard</div>
        </div>
        <div className="browser-inner">
          </div>  
          <div className="db-main">
            <div className="db-topbar">
              <div className="db-page-title">Nhiệm vụ hôm nay ☀️</div>
              <button className="db-add-btn">+ Thêm nhiệm vụ</button>
            </div>
            <div className="db-summary">
              {summaryCards.map((c, i) => (
                <div className="db-sum-card" key={i}>
                  <div className="db-sum-n">{c.n}</div>
                  <div className="db-sum-l">{c.l}</div>
                </div>
              ))}
            </div>
            <div className="db-tasks">
              {dbTasks.map((t, i) => (
                <div className="db-task" key={i}>
                  <div className="db-bar" style={{ background: t.bar }}></div>
                  <div className="db-task-info">
                    <div className="db-task-name">{t.name}</div>
                    <div className="db-task-meta">{t.meta}</div>
                  </div>
                  <div className="db-badge" style={{ background: t.badgeBg, color: t.badgeColor }}>{t.badge}</div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </section>
  );
}

// ════════════════════════════════
// COMPONENT: Testimonials
// ════════════════════════════════
function Testimonials() {
  const labelRef = useFadeUp();
  const titleRef = useFadeUp();

  const reviews = [
    { av: 'MH', name: 'Minh Hùng',  role: 'Product Manager, FPT Software', delay: '0s',   text: '"Từ ngày dùng Web Reminder, mình không còn bị trễ deadline nữa. Ma trận Eisenhower thực sự thay đổi cách mình nhìn nhận công việc!"' },
    { av: 'TN', name: 'Thu Ngân',   role: 'Freelance Designer',             delay: '0.1s', text: '"Pomodoro Timer tích hợp sẵn là điểm cộng rất lớn. Mình làm việc hiệu quả hơn 40% so với trước. Giao diện đẹp, dễ dùng, không bị rối mắt."' },
    { av: 'PL', name: 'Phước Lộc',  role: 'Sinh viên, ĐH Bách Khoa HN',   delay: '0.2s', text: '"Là sinh viên bận rộn, Web Reminder giúp mình cân bằng giữa học và làm việc part-time. Không có app này, mình không biết sống sao nữa!"' },
  ];

  return (
    <section className="testimonials">
      <div className="section-inner">
        <div className="section-label fade-up" ref={labelRef}>Người dùng nói gì</div>
        <h2 className="section-h2 fade-up" ref={titleRef}>Hàng nghìn người đã thay đổi thói quen làm việc</h2>
        <div className="testi-grid">
          {reviews.map((r, i) => {
            const cardRef = useFadeUp(); // eslint-disable-line
            return (
              <div className="testi-card fade-up" key={i} style={{ transitionDelay: r.delay }} ref={cardRef}>
                <div className="testi-stars">{'★★★★★'.split('').map((s, j) => <span className="star" key={j}>{s}</span>)}</div>
                <div className="testi-text">{r.text}</div>
                <div className="testi-author">
                  <div className="testi-av">{r.av}</div>
                  <div>
                    <div className="testi-name">{r.name}</div>
                    <div className="testi-role">{r.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

  

export default function Home(){
  return (
    <>
      <Hero />
      <Features />
      <CTA />
      <HowToUse />
      <Demo />
      <Testimonials />
    </>
  );
}