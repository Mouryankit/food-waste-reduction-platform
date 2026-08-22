const { generateOtp, verifyOtp, resetPassword } = require('../controllers/passwordReset');
const OTP = require('../models/otpSchema');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailHelper');
const plainToHashPassword = require('../utils/hash');

// Mock dependencies
jest.mock('../models/otpSchema');
jest.mock('../models/User');
jest.mock('../utils/emailHelper', () => ({
    sendEmail: jest.fn()
}));
jest.mock('../utils/hash', () => jest.fn());

describe('Password Reset Controller Unit Tests', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret-key-12345';
        mockReq = {
            body: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('generateOtp', () => {
        it('should successfully generate and send OTP', async () => {
            mockReq.body.email = 'test@example.com';
            OTP.create.mockResolvedValue({});
            sendEmail.mockResolvedValue({ messageId: '12345' });

            await generateOtp(mockReq, mockRes);

            expect(OTP.create).toHaveBeenCalledWith(expect.objectContaining({
                email: 'test@example.com',
                otp: expect.any(String)
            }));
            expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
                to: 'test@example.com',
                subject: expect.any(String),
                text: expect.any(String)
            }));
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'OTP sent successfully' });
        });

        it('should return 500 status on database/email error', async () => {
            mockReq.body.email = 'test@example.com';
            OTP.create.mockRejectedValue(new Error('DB error'));

            await generateOtp(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Error sending OTP',
                error: 'DB error'
            });
        });
    });

    describe('verifyOtp', () => {
        it('should return 401 if otp is missing', async () => {
            mockReq.body = { email: 'test@example.com' };

            await verifyOtp(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'otp is required' });
        });

        it('should verify OTP and return token on success', async () => {
            mockReq.body = { email: 'test@example.com', otp: '123456' };
            const mockExec = jest.fn().mockResolvedValue({ email: 'test@example.com', otp: '123456' });
            OTP.findOne.mockReturnValue({ exec: mockExec });

            await verifyOtp(mockReq, mockRes);

            expect(OTP.findOne).toHaveBeenCalledWith({ email: 'test@example.com', otp: '123456' });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'OTP verified successfully',
                token: expect.any(String)
            }));
        });

        it('should return 400 if OTP is invalid', async () => {
            mockReq.body = { email: 'test@example.com', otp: '111111' };
            const mockExec = jest.fn().mockResolvedValue(null);
            OTP.findOne.mockReturnValue({ exec: mockExec });

            await verifyOtp(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid OTP' });
        });

        it('should return 400 on database error during verification', async () => {
            mockReq.body = { email: 'test@example.com', otp: '123456' };
            const mockExec = jest.fn().mockRejectedValue(new Error('Find error'));
            OTP.findOne.mockReturnValue({ exec: mockExec });

            await verifyOtp(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Error verifying OTP'
            }));
        });
    });

    describe('resetPassword', () => {
        it('should return error if password is missing', async () => {
            mockReq.body = { email: 'test@example.com' };

            await resetPassword(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ message: 'password is missing' });
        });

        it('should return error if email is missing', async () => {
            mockReq.body = { password: 'newpassword123' };

            await resetPassword(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ message: 'email is missing' });
        });

        it('should successfully update user password', async () => {
            mockReq.body = { email: 'test@example.com', password: 'newpassword123' };
            plainToHashPassword.mockResolvedValue('hashed_new_password');
            User.updateOne.mockResolvedValue({ nModified: 1 });

            await resetPassword(mockReq, mockRes);

            expect(plainToHashPassword).toHaveBeenCalledWith('newpassword123');
            expect(User.updateOne).toHaveBeenCalledWith(
                { email: 'test@example.com' },
                { $set: { password: 'hashed_new_password' } }
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'passsword reset succesfully' });
        });

        it('should return error if database update fails', async () => {
            mockReq.body = { email: 'test@example.com', password: 'newpassword123' };
            plainToHashPassword.mockResolvedValue('hashed_new_password');
            User.updateOne.mockRejectedValue(new Error('Update failed'));

            await resetPassword(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Error in reset password'
            }));
        });
    });
});
