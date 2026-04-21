const contactEmailTemplate = ({ name, email, company, interest, message }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Submission</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          background: #f8fafc;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        .container {
          max-width: 620px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.06);
          border: 1px solid #e2e8f0;
        }
        
        .header {
          background: linear-gradient(135deg, #7c2d12 0%, #f97316 100%);
          color: white;
          padding: 40px 50px;
          text-align: center;
        }
        
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 600;
          letter-spacing: -0.025em;
        }
        
        .content {
          padding: 45px 50px;
        }
        
        .field {
          display: flex;
          margin-bottom: 22px;
          align-items: flex-start;
        }
        
        .label {
          font-weight: 500;
          color: #64748b;
          width: 130px;
          flex-shrink: 0;
          font-size: 15px;
        }
        
        .value {
          flex: 1;
          font-size: 16px;
          color: #1e2937;
          line-height: 1.55;
        }
        
        .highlight {
          color: #ea580c;
          font-weight: 500;
        }
        
        .message-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 28px;
          margin-top: 32px;
        }
        
        .message-box h3 {
          margin: 0 0 14px 0;
          color: #7c2d12;
          font-size: 17px;
          font-weight: 600;
        }
        
        .footer {
          background: #f8fafc;
          padding: 28px 50px;
          text-align: center;
          font-size: 13.5px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>New Contact Form Submission</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.85; font-size: 15px;">BharatX Infratech</p>
        </div>

        <!-- Main Content -->
        <div class="content">
          <div class="field">
            <div class="label">Name</div>
            <div class="value"><strong>${name}</strong></div>
          </div>
          
          <div class="field">
            <div class="label">Email</div>
            <div class="value highlight">${email}</div>
          </div>
          
          ${company ? `
          <div class="field">
            <div class="label">Company</div>
            <div class="value">${company}</div>
          </div>` : ""}
          
          <div class="field">
            <div class="label">Interest</div>
            <div class="value">${interest}</div>
          </div>

          <!-- Message Section -->
          <div class="message-box">
            <h3>Message</h3>
            <div style="line-height: 1.75; color: #334155;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          Received on ${new Date().toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
        </div>
      </div>
    </body>
    </html>
  `;
};

export default contactEmailTemplate;
