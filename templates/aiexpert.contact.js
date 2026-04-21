const contactEmailTemplate = ({ name, email, phone, subject, message }) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Message</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #f8fafc;
          margin: 0;
          padding: 0;
          color: #1e2937;
        }
        
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }
        
        .header {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          padding: 32px 40px;
          text-align: center;
        }
        
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        
        .content {
          padding: 40px;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 20px;
          align-items: flex-start;
        }
        
        .label {
          font-weight: 500;
          color: #64748b;
          width: 100px;
          flex-shrink: 0;
          font-size: 14px;
        }
        
        .value {
          flex: 1;
          font-size: 15.5px;
          line-height: 1.5;
          color: #1e2937;
        }
        
        .message-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin-top: 28px;
        }
        
        .message-box h3 {
          margin: 0 0 12px 0;
          color: #1e40af;
          font-size: 16px;
          font-weight: 600;
        }
        
        .footer {
          text-align: center;
          padding: 24px 40px;
          background: #f8fafc;
          color: #64748b;
          font-size: 13px;
          border-top: 1px solid #e2e8f0;
        }
        
        .highlight {
          color: #3b82f6;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>New Contact Message</h1>
        </div>

        <!-- Content -->
        <div class="content">
          <div class="info-row">
            <div class="label">Name</div>
            <div class="value"><strong>${name}</strong></div>
          </div>
          
          <div class="info-row">
            <div class="label">Email</div>
            <div class="value highlight">${email}</div>
          </div>
          
          ${phone ? `
          <div class="info-row">
            <div class="label">Phone</div>
            <div class="value">${phone}</div>
          </div>` : ""}
          
          ${subject ? `
          <div class="info-row">
            <div class="label">Subject</div>
            <div class="value">${subject}</div>
          </div>` : ""}

          <!-- Message -->
          <div class="message-box">
            <h3>Message</h3>
            <div style="line-height: 1.7; color: #334155;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          Received on ${new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    })}
        </div>
      </div>
    </body>
  </html>
  `;
};

export default contactEmailTemplate;