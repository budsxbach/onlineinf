import os
import email
import imaplib
import smtplib
from email.mime.text import MIMEText

try:
    import openai
except ImportError:
    openai = None

class EmailAgent:
    def __init__(self, imap_server, smtp_server, email_address, password):
        self.imap_server = imap_server
        self.smtp_server = smtp_server
        self.email_address = email_address
        self.password = password

    def _connect_imap(self):
        conn = imaplib.IMAP4_SSL(self.imap_server)
        conn.login(self.email_address, self.password)
        return conn

    def _connect_smtp(self):
        conn = smtplib.SMTP_SSL(self.smtp_server)
        conn.login(self.email_address, self.password)
        return conn

    def fetch_unread(self):
        conn = self._connect_imap()
        conn.select('INBOX')
        typ, data = conn.search(None, '(UNSEEN)')
        for num in data[0].split():
            typ, msg_data = conn.fetch(num, '(RFC822)')
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    yield msg
            conn.store(num, '+FLAGS', '\\Seen')
        conn.close()
        conn.logout()

    def generate_reply(self, message):
        if openai is None:
            # Fallback simple reply
            return 'Vielen Dank für Ihre Nachricht.'
        openai.api_key = os.environ.get('OPENAI_API_KEY')
        prompt = f"Beantworte die folgende Email höflich:\n\n{message.get_payload(decode=True).decode(errors='ignore')}"
        response = openai.Completion.create(
            engine='text-davinci-003',
            prompt=prompt,
            max_tokens=150
        )
        return response['choices'][0]['text'].strip()

    def send_reply(self, to_addr, subject, body):
        msg = MIMEText(body)
        msg['Subject'] = 'Re: ' + subject
        msg['From'] = self.email_address
        msg['To'] = to_addr
        smtp_conn = self._connect_smtp()
        smtp_conn.sendmail(self.email_address, [to_addr], msg.as_string())
        smtp_conn.quit()

    def run(self):
        for message in self.fetch_unread():
            reply = self.generate_reply(message)
            self.send_reply(message['From'], message['Subject'], reply)

if __name__ == '__main__':
    # Example usage
    agent = EmailAgent(
        imap_server=os.environ.get('IMAP_SERVER'),
        smtp_server=os.environ.get('SMTP_SERVER'),
        email_address=os.environ.get('EMAIL_ADDRESS'),
        password=os.environ.get('EMAIL_PASSWORD'),
    )
    agent.run()
