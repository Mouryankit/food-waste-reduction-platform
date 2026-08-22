// Mock dotenv before anything else
jest.mock('dotenv', () => ({
    config: jest.fn()
}));

let mockSendMail = jest.fn();
let mockCreateTransport = jest.fn(() => ({
    sendMail: mockSendMail
}));

// Mock nodemailer with deferred execution
jest.mock('nodemailer', () => ({
    createTransport: (options) => mockCreateTransport(options)
}));

const { sendEmail } = require('../utils/emailHelper');

describe('Email Helper Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSendMail = jest.fn();
        mockCreateTransport = jest.fn(() => ({
            sendMail: mockSendMail
        }));
        
        // Setup default test environment variables
        process.env.SMTP_HOST = 'smtp.example.com';
        process.env.SMTP_PORT = '465';
        process.env.SMTP_USER = 'user@example.com';
        process.env.SMTP_PASS = 'password123';
        process.env.SMTP_FROM = 'noreply@example.com';
    });

    afterEach(() => {
        jest.resetModules();
    });

    it('should throw an error if SMTP_FROM and SMTP_USER are not set', async () => {
        delete process.env.SMTP_USER;
        delete process.env.SMTP_FROM;
        
        const { sendEmail: freshSendEmail } = require('../utils/emailHelper');
        await expect(freshSendEmail({
            to: 'test@example.com',
            subject: 'Hello',
            text: 'World'
        })).rejects.toThrow('SMTP sender address (SMTP_FROM or SMTP_USER) is not configured in environment variables.');
    });

    it('should send email using SMTP_FROM as sender address', async () => {
        mockSendMail.mockResolvedValue({ messageId: 'msg-123' });

        const { sendEmail: freshSendEmail } = require('../utils/emailHelper');
        const info = await freshSendEmail({
            to: 'receiver@example.com',
            subject: 'Test Subject',
            text: 'Test Body',
            html: '<p>Test Body</p>'
        });

        expect(mockCreateTransport).toHaveBeenCalledWith(expect.objectContaining({
            port: 465,
            secure: true
        }));
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            from: 'noreply@example.com',
            to: 'receiver@example.com',
            subject: 'Test Subject',
            text: 'Test Body',
            html: '<p>Test Body</p>'
        }));
        expect(info.messageId).toBe('msg-123');
    });

    it('should send email using SMTP_USER if SMTP_FROM is missing', async () => {
        delete process.env.SMTP_FROM;
        mockSendMail.mockResolvedValue({ messageId: 'msg-user-sender' });

        const { sendEmail: freshSendEmail } = require('../utils/emailHelper');
        const info = await freshSendEmail({
            to: 'receiver@example.com',
            subject: 'Test Subject',
            text: 'Test Body'
        });

        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            from: 'user@example.com'
        }));
        expect(info.messageId).toBe('msg-user-sender');
    });

    it('should format bcc array into comma-separated string', async () => {
        mockSendMail.mockResolvedValue({ messageId: 'msg-bcc' });

        const { sendEmail: freshSendEmail } = require('../utils/emailHelper');
        await freshSendEmail({
            bcc: ['ngo1@example.com', 'ngo2@example.com'],
            subject: 'BCC Subject',
            text: 'BCC Body'
        });

        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            from: 'noreply@example.com',
            bcc: 'ngo1@example.com,ngo2@example.com'
        }));
    });

    it('should print warning if sender is brevo email but SMTP_FROM is not defined', async () => {
        delete process.env.SMTP_FROM;
        process.env.SMTP_USER = 'abc@smtp-brevo.com';
        mockSendMail.mockResolvedValue({ messageId: 'msg-brevo' });

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const { sendEmail: freshSendEmail } = require('../utils/emailHelper');
        await freshSendEmail({
            to: 'ngo@example.com',
            subject: 'Brevo Subject',
            text: 'Brevo Body'
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Warning: SMTP_FROM is not defined'));
        consoleWarnSpy.mockRestore();
    });

    it('should log and throw error if sendMail fails', async () => {
        const sendError = new Error('SMTP Connection Refused');
        mockSendMail.mockRejectedValue(sendError);

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const { sendEmail: freshSendEmail } = require('../utils/emailHelper');
        await expect(freshSendEmail({
            to: 'receiver@example.com',
            subject: 'Fail Subject',
            text: 'Fail Body'
        })).rejects.toThrow('SMTP Connection Refused');

        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
});
