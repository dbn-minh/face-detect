export default class ParentController {
    static async getParentDetails(req, res) {
        const parentID = req.params.parentID; // Assuming parentID is passed as a URL parameter

        try {
            const parentDetails = await Parent.findOne({
                where: { parentID: parentID },
                include: [{
                    model: User,
                    as: 'user', // This matches the alias used in your initModels function
                    attributes: ['name', 'phoneNumber', 'email'] // Selecting specific attributes from the User model
                }, {
                    model: Student,
                    as: 'Students', // Include associated students if you want to show student's details
                    attributes: ['studentID', 'name', 'class', 'avatar']
                }]
            });

            if (parentDetails) {
                res.status(200).json(parentDetails);
            } else {
                res.status(404).json({ message: "Parent not found" });
            }
        } catch (error) {
            console.error("Error fetching parent details:", error);
            res.status(500).json({ message: "An error occurred while fetching parent details" });
        }
    }

    static async updateParentDetails(req, res) {
        // Function to update parent details
    }

    static async createParentDetails(req, res) {
        // Function to create parent details
    }

    static async getNotifications(req, res) {
        // Function to get parent notifications
    }

    static async getBusTracking(req, res) {
        // Function to get bus tracking info
    }

    static async getParentProfile(req, res) {
        // Function to get parent profile
    }

    static async updateParentProfile(req, res) {
        // Function to update parent profile
    }

    static async createParentProfile(req, res) {
        // Function to create parent profile
    }

    static async deleteParentProfile(req, res) {
        // Function to delete parent profile
    }

    static async registerStudent(req, res) {
        // Function to register student for bus
    }

    static async logoutParent(req, res) {
        // Function to handle parent logout
    }
}
