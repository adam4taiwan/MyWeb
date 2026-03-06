import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('警告: SENDGRID_API_KEY 未设置');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface ConsultationRequest {
  service: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  gender: string;
  maritalStatus: string;
  occupation: string;
  subject: string;
  priority: string;
  consultationType: string;
  questions: string;
}

export async function POST(request: Request) {
  try {
    const body: ConsultationRequest = await request.json();

    // 验证必填字段
    if (!body.name || !body.email || !body.subject || !body.questions) {
      return Response.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return Response.json(
        { error: '邮箱格式无效' },
        { status: 400 }
      );
    }

    // 构建邮件内容
    const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { border: 1px solid #e5e7eb; padding: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; color: #1f2937; margin-bottom: 10px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; }
          .field { margin-bottom: 8px; }
          .label { font-weight: bold; color: #6b7280; }
          .footer { background-color: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>新的咨询请求</h2>
            <p>收到了一份来自您网站的咨询申请</p>
          </div>

          <div class="content">
            <div class="section">
              <div class="section-title">咨询服务</div>
              <div class="field">
                <span class="label">服务类型:</span> ${body.service}
              </div>
              <div class="field">
                <span class="label">优先程度:</span> ${getPriorityLabel(body.priority)}
              </div>
              <div class="field">
                <span class="label">咨询类型:</span> ${getConsultationTypeLabel(body.consultationType)}
              </div>
            </div>

            <div class="section">
              <div class="section-title">客户基本信息</div>
              <div class="field">
                <span class="label">姓名:</span> ${body.name}
              </div>
              <div class="field">
                <span class="label">邮箱:</span> ${body.email}
              </div>
              <div class="field">
                <span class="label">电话:</span> ${body.phone || '未提供'}
              </div>
            </div>

            <div class="section">
              <div class="section-title">生辰信息</div>
              <div class="field">
                <span class="label">出生日期:</span> ${body.birthDate}
              </div>
              <div class="field">
                <span class="label">出生时间:</span> ${body.birthTime || '未提供'}
              </div>
              <div class="field">
                <span class="label">出生地点:</span> ${body.birthPlace || '未提供'}
              </div>
              <div class="field">
                <span class="label">性别:</span> ${getGenderLabel(body.gender)}
              </div>
              <div class="field">
                <span class="label">婚姻状况:</span> ${getMaritalStatusLabel(body.maritalStatus)}
              </div>
              <div class="field">
                <span class="label">职业:</span> ${body.occupation || '未提供'}
              </div>
            </div>

            <div class="section">
              <div class="section-title">咨询详情</div>
              <div class="field">
                <span class="label">主题:</span> ${body.subject}
              </div>
              <div class="field">
                <span class="label">问题描述:</span>
                <pre style="background-color: #f9fafb; padding: 12px; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word;">${body.questions}</pre>
              </div>
            </div>

            <div class="section" style="background-color: #fef3c7; padding: 12px; border-radius: 4px; border-left: 4px solid #f59e0b;">
              <span class="label">建议回复时间:</span> 24小时内确认收件，3-5个工作天内提供分析报告
            </div>
          </div>

          <div class="footer">
            <p>此邮件由来自您的命理咨询平台自动生成</p>
            <p>请勿直接回复此邮件，请通过平台直接联系咨询者</p>
          </div>
        </div>
      </body>
    </html>
    `;

    // 发送给管理员的邮件
    const adminMsg = {
      to: 'adam4taiwan@gmail.com',
      from: 'adam4taiwan@gmail.com',
      subject: `[新咨询] ${body.subject} - 来自 ${body.name}`,
      html: htmlContent,
    };

    // 发送给客户的确认邮件
    const customerMsg = {
      to: body.email,
      from: 'adam4taiwan@gmail.com',
      subject: '咨询申请已收到 - MyWeb 命理咨询平台',
      html: `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { border: 1px solid #e5e7eb; padding: 20px; }
            .footer { background-color: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; text-align: center; }
            .checklist { list-style: none; padding: 0; }
            .checklist li { padding: 8px 0; padding-left: 24px; position: relative; }
            .checklist li:before { content: "✓"; position: absolute; left: 0; color: #16a34a; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>感谢咨询！</h2>
              <p>我们已成功收到您的申请</p>
            </div>

            <div class="content">
              <p>亲爱的 ${body.name} 您好，</p>

              <p>感谢您选择我们的命理咨询服务。您的申请已成功提交。</p>

              <h3>咨询详情确认：</h3>
              <p><strong>咨询主题：</strong> ${body.subject}</p>
              <p><strong>咨询类型：</strong> ${getConsultationTypeLabel(body.consultationType)}</p>
              <p><strong>优先程度：</strong> ${getPriorityLabel(body.priority)}</p>

              <h3>接下来的流程：</h3>
              <ul class="checklist">
                <li>24小时内确认收件并回复预估时间</li>
                <li>3-5个工作天内提供详细分析报告</li>
                <li>如需补充资料会另行联系</li>
                <li>报告将以PDF格式寄送至您的信箱</li>
              </ul>

              <p>如有任何问题，欢迎通过以下方式联系我们：</p>
              <ul>
                <li>📧 电子邮件: adam4taiwan@gmail.com</li>
                <li>☎️ 专线电话: 0910-032-057</li>
                <li>📱 预约专线: 0970975258</li>
              </ul>

              <p>再次感谢您的信任！</p>
            </div>

            <div class="footer">
              <p>MyWeb 命理咨询平台</p>
              <p>此邮件为系统自动发送，请勿直接回复</p>
            </div>
          </div>
        </body>
      </html>
      `,
    };

    // 同时发送两封邮件
    try {
      await Promise.all([
        sgMail.send(adminMsg as any),
        sgMail.send(customerMsg as any),
      ]);

      console.log(`✅ 邮件发送成功 - 管理员和客户邮件已发送`);
      console.log(`📧 发送给管理员: adam4taiwan@gmail.com`);
      console.log(`📧 发送给客户: ${body.email}`);
      console.log(`📌 咨询主题: ${body.subject}`);

      return Response.json(
        {
          success: true,
          message: '咨询申请已提交，请检查您的邮箱确认',
          referenceId: `CON-${Date.now()}`,
        },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('❌ SendGrid 邮件发送失败:', emailError);
      throw emailError;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';

    console.error('❌ 咨询提交失败:');
    console.error(`   错误类型: ${error?.constructor?.name}`);
    console.error(`   错误信息: ${errorMessage}`);
    console.error(`   完整错误:`, error);

    // 如果是 SendGrid API 错误
    if (errorMessage.includes('Invalid from email address')) {
      return Response.json(
        { error: '邮件发送配置错误（发件人地址无效）' },
        { status: 500 }
      );
    }

    if (errorMessage.includes('Unauthorized')) {
      return Response.json(
        { error: '邮件发送配置错误（API Key 无效）' },
        { status: 500 }
      );
    }

    return Response.json(
      { error: '邮件发送失败，请重试或联系管理员' },
      { status: 500 }
    );
  }
}

// 辅助函数
function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    normal: '一般',
    urgent: '紧急',
    'very-urgent': '非常紧急',
  };
  return labels[priority] || priority;
}

function getConsultationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    detailed: '详细分析',
    brief: '简要回复',
    specific: '特定问题',
  };
  return labels[type] || type;
}

function getGenderLabel(gender: string): string {
  const labels: Record<string, string> = {
    male: '男性',
    female: '女性',
  };
  return labels[gender] || gender;
}

function getMaritalStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    single: '未婚',
    married: '已婚',
    divorced: '离婚',
    widowed: '丧偶',
  };
  return labels[status] || status;
}
