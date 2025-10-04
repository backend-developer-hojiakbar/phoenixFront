import React from 'react';

interface CertificateProps {
  userName: string;
  fileName: string;
  originality: number;
  date: string;
  checkId: string;
}

export const PlagiarismCertificate: React.FC<CertificateProps> = ({ userName, fileName, originality, date, checkId }) => {
  return (
    <div id="certificate-to-download" style={{ width: '1024px', height: '724px', position: 'absolute', left: '-9999px', top: 0, fontFamily: 'Arial, sans-serif', border: '10px double #005A8D', padding: '10px', backgroundColor: 'white' }}>
      <div style={{ border: '2px solid #005A8D', width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ border: '2px solid #005A8D', padding: '10px' }}>
              <div style={{ border: '1px solid #005A8D', padding: '5px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7V17L12 22L21 17V7L12 2ZM5 8.5L12 12.5L19 8.5V15.5L12 19.5L5 15.5V8.5Z" fill="#005A8D"/>
                </svg>
              </div>
            </div>
            <span style={{ marginLeft: '10px', color: '#005A8D', fontSize: '24px', fontWeight: 'bold' }}>ANTIPLAG</span>
          </div>
          <div style={{ textAlign: 'right', color: '#333' }}>
            <div style={{ fontSize: '14px' }}>Tekshirish sanasi</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{date}</div>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>Raqami</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{checkId}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#333', margin: 0 }}>SERTIFIKAT</h1>
          <h2 style={{ fontSize: '36px', fontWeight: 'normal', color: '#555', marginTop: '10px', paddingBottom: '15px', borderBottom: '2px solid #005A8D', display: 'inline-block' }}>{userName}</h2>
        </div>

        <div style={{ margin: '40px auto', width: '600px', border: '1px solid #ccc', padding: '20px', backgroundColor: '#f9f9f9' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ddd' }}><td style={{ padding: '10px', fontWeight: 'bold', color: '#555' }}>Muallif</td><td style={{ padding: '10px', textAlign: 'right' }}>{userName}</td></tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}><td style={{ padding: '10px', fontWeight: 'bold', color: '#555' }}>Ish turi</td><td style={{ padding: '10px', textAlign: 'right' }}>belgilanmagan</td></tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}><td style={{ padding: '10px', fontWeight: 'bold', color: '#555' }}>Fayl nomi</td><td style={{ padding: '10px', textAlign: 'right' }}>{fileName}</td></tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}><td style={{ padding: '10px', fontWeight: 'bold', color: '#555' }}>Iqtiboslar</td><td style={{ padding: '10px', textAlign: 'right' }}>0%</td></tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}><td style={{ padding: '10px', fontWeight: 'bold', color: '#555' }}>O'z-o'ziga iqtibos</td><td style={{ padding: '10px', textAlign: 'right' }}>0%</td></tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}><td style={{ padding: '10px', fontWeight: 'bold', color: '#555' }}>O'zlashtirish</td><td style={{ padding: '10px', textAlign: 'right' }}>{(100 - originality).toFixed(2)}%</td></tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}><td style={{ padding: '10px', fontSize: '20px', fontWeight: 'bold', color: '#008000' }}>Originallik</td><td style={{ padding: '10px', fontSize: '20px', fontWeight: 'bold', color: '#008000', textAlign: 'right' }}>{originality.toFixed(2)}%</td></tr>
              <tr><td style={{ padding: '10px', fontWeight: 'bold', color: '#555' }}>Qidiruv modullari</td><td style={{ padding: '10px', textAlign: 'right' }}>29 ta moduldan / 15 tasida tekshirilgan</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '20px 40px' }}>
          <div>
            <span style={{ color: '#005A8D', fontSize: '12px' }}>© 2021-2025, MCHJ "Perspective Team". Barcha huquqlar himoyalangan.</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            {/* QR Code placeholder */}
            <svg width="80" height="80" viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
              <rect width="100" height="100" fill="#fff"/>
              <rect x="10" y="10" width="20" height="20" fill="#000"/><rect x="40" y="10" width="10" height="10" fill="#000"/><rect x="60" y="10" width="30" height="10" fill="#000"/>
              <rect x="10" y="40" width="10" height="10" fill="#000"/><rect x="30" y="30" width="10" height="20" fill="#000"/><rect x="50" y="40" width="20" height="10" fill="#000"/>
              <rect x="10" y="60" width="30" height="10" fill="#000"/><rect x="50" y="60" width="10" height="20" fill="#000"/><rect x="70" y="70" width="20" height="20" fill="#000"/>
            </svg>
            <p style={{ fontSize: '10px', color: '#555', margin: '5px 0 0 0', maxWidth: '150px' }}>Ma'lumotlarning haqqoniyligini tekshirish uchun sertifikatdagi QR koddan foydalaning.</p>
          </div>
        </div>
      </div>
    </div>
  );
};