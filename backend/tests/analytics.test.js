const { getAnalytics } = require('../controllers/analytics');
const User = require('../models/User');
const Donation = require('../models/donationSchema');

// Mock models
jest.mock('../models/User');
jest.mock('../models/donationSchema');

describe('Analytics Controller Unit Tests', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should aggregate and return correct analytics data', async () => {
        // Setup mock counts for countDocuments
        User.countDocuments.mockImplementation((query) => {
            if (!query) return Promise.resolve(20); // total users
            if (query.role === 'restaurant') return Promise.resolve(12);
            if (query.role === 'ngo') return Promise.resolve(8);
            return Promise.resolve(0);
        });

        Donation.countDocuments.mockImplementation((query) => {
            if (!query) return Promise.resolve(100); // total donations
            if (query.deliveryStatus === 'pending') return Promise.resolve(30);
            if (query.deliveryStatus === 'accepted') return Promise.resolve(45);
            if (query.deliveryStatus === 'delivered') return Promise.resolve(20);
            if (query.deliveryStatus === 'cancelled') return Promise.resolve(5);
            // Handling dates (daily, weekly, monthly)
            if (query.createdAt && query.createdAt.$gte) {
                return Promise.resolve(10); // arbitrary count for time-filtered queries
            }
            return Promise.resolve(0);
        });

        await getAnalytics(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            analytics: {
                totalUsers: 20,
                totalRestaurants: 12,
                totalNGOs: 8,
                totalDonations: 100,
                pending: 30,
                accepted: 45,
                delivered: 20,
                cancelled: 5,
                dailyDonations: 10,
                weeklyDonations: 10,
                monthlyDonations: 10
            }
        });
    });

    it('should return 500 status if model operations fail', async () => {
        User.countDocuments.mockRejectedValue(new Error('Database Failure'));

        await getAnalytics(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Database Failure'
        });
    });
});
