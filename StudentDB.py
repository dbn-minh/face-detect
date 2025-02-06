import mysql.connector
from mysql.connector import errorcode
import faker
import random
import datetime
import base64
import bcrypt

# Database connection configuration
config = {
    'user': 'user',
    'password': 'user',
    'host': '127.0.0.1',
    'database': 'studentdb',
    'raise_on_warnings': True
}

# Initialize Faker
fake = faker.Faker()

# Custom phone number provider
class CustomProvider(faker.providers.BaseProvider):
    def phone_number(self):
        prefix = fake.random_element(elements=['090', '070', '028'])
        return prefix + ''.join(str(fake.random_digit()) for _ in range(7))

# Add the custom provider to Faker
fake.add_provider(CustomProvider)

# Helper function to generate base64 encoded avatar
def generate_base64_avatar():
    return f"https://example.com/avata.jpg"

# Helper function to generate feature vector data
def generate_feature_vector():
    return base64.b64encode(fake.binary(length=128)).decode('utf-8')

# Hash mật khẩu mặc định '1234'
default_password = '1234'
hashed_password = bcrypt.hashpw(default_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Lấy số vòng băm từ hash
rounds = int(hashed_password.split('$')[2])
print(f"Số vòng băm (rounds) của bcrypt: {rounds}")

# Giả lập refresh token (chỉ là một chuỗi ngẫu nhiên cho mục đích minh họa)
def generate_fake_refresh_token():
    return 'Bearer ' + ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', k=50))

# Connect to the database
try:
    cnx = mysql.connector.connect(**config)
    cursor = cnx.cursor()

    # Drop tables if they exist
    cursor.execute("DROP TABLE IF EXISTS Notification;")
    cursor.execute("DROP TABLE IF EXISTS Attendance;")
    cursor.execute("DROP TABLE IF EXISTS Journey;")
    cursor.execute("DROP TABLE IF EXISTS Student_Parent;")
    cursor.execute("DROP TABLE IF EXISTS Student;")
    cursor.execute("DROP TABLE IF EXISTS Bus;")
    cursor.execute("DROP TABLE IF EXISTS Teacher;")
    cursor.execute("DROP TABLE IF EXISTS Driver;")
    cursor.execute("DROP TABLE IF EXISTS Parent;")
    cursor.execute("DROP TABLE IF EXISTS Feedback;")
    cursor.execute("DROP TABLE IF EXISTS User;")
    cursor.execute("DROP TABLE IF EXISTS Role;")

    # Create tables
    cursor.execute("""
        CREATE TABLE Role (
            role_id INT PRIMARY KEY AUTO_INCREMENT,
            role_name VARCHAR(255) NOT NULL
        );
    """)
    print("Role table created")

    cursor.execute("""
        CREATE TABLE User (
            user_id INT PRIMARY KEY AUTO_INCREMENT,
            role_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            phone_number VARCHAR(15) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            refresh_token TEXT NULL,
            FOREIGN KEY (role_id) REFERENCES Role(role_id)
        );
    """)
    print("User table created")

    cursor.execute("""
            CREATE TABLE Feedback (
                feedback_id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                content VARCHAR(255) NOT NULL,
                status ENUM('unsolved', 'solved') NOT NULL DEFAULT 'unsolved',
                time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES User(user_id)
            );
        """)
    print("Feedback table created")

    cursor.execute("""
        CREATE TABLE Parent (
            parent_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL UNIQUE,
            address VARCHAR(255) NOT NULL,
            relationship ENUM('Father', 'Mother', 'Other') NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(user_id)
        );
    """)
    print("Parent table created")

    cursor.execute("""
        CREATE TABLE Driver (
            driver_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL UNIQUE,
            license_number VARCHAR(50) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(user_id)
        );
    """)
    print("Driver table created")

    cursor.execute("""
        CREATE TABLE Teacher (
            teacher_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL UNIQUE,
            department VARCHAR(255) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(user_id)
        );
    """)
    print("Teacher table created")

    cursor.execute("""
           CREATE TABLE Bus (
               bus_id INT PRIMARY KEY AUTO_INCREMENT,
               driver_id INT NULL UNIQUE,
               teacher_id INT NULL UNIQUE, 
               capacity INT NOT NULL,
               license_plate VARCHAR(50) NOT NULL,
               current_location POINT,
               status ENUM('ongoing', 'stopped', 'broken') NULL, 
               FOREIGN KEY (driver_id) REFERENCES Driver(driver_id),
               FOREIGN KEY (teacher_id) REFERENCES Teacher(teacher_id)
           );
       """)
    print("Bus table created")

    cursor.execute("""
        CREATE TABLE Student (
            student_id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            class VARCHAR(50) NOT NULL,
            bus_id INT NULL,
            avatar TEXT,
            feature_vector TEXT,
            FOREIGN KEY (bus_id) REFERENCES Bus(bus_id)
        );
    """)
    print("Student table created")

    cursor.execute("""
        CREATE TABLE Student_Parent (
            student_id INT NOT NULL,
            parent_id INT NOT NULL,
            PRIMARY KEY (student_id, parent_id),
            FOREIGN KEY (student_id) REFERENCES Student(student_id),
            FOREIGN KEY (parent_id) REFERENCES Parent(parent_id)
        );
        """)
    print("Student_Parent table created")

    cursor.execute("""
        CREATE TABLE Journey (
            journey_id INT PRIMARY KEY AUTO_INCREMENT,
            bus_id INT NOT NULL,
            start_time DATETIME NOT NULL,
            end_time DATETIME NULL,
            status ENUM('ongoing', 'completed') NOT NULL,
            FOREIGN KEY (bus_id) REFERENCES Bus(bus_id)
        );
    """)
    print("Journey table created")

    cursor.execute("""
        CREATE TABLE Attendance (
            attendance_id INT PRIMARY KEY AUTO_INCREMENT,
            student_id INT NOT NULL,
            journey_id INT NOT NULL,
            boarded DATETIME NULL,
            alighted DATETIME NULL,
            status ENUM('absent', 'boarded', 'alighted', 'not alighted', 'completed') DEFAULT 'absent',
            FOREIGN KEY (student_id) REFERENCES Student(student_id),
            FOREIGN KEY (journey_id) REFERENCES Journey(journey_id)
        );
    """)
    print("Attendance table created")

    cursor.execute("""
        CREATE TABLE Notification (
            notification_id INT PRIMARY KEY AUTO_INCREMENT,
            attendance_id INT NOT NULL,
            time_stamp DATETIME NOT NULL,
            message VARCHAR(255) NOT NULL,
            image TEXT NULL,
            status ENUM('common', 'alert') NOT NULL,
            FOREIGN KEY (attendance_id) REFERENCES Attendance(attendance_id)
        );
    """)
    print("Notification table created")

    # Insert fake data
    roles = ['Parent', 'Driver', 'Teacher']
    for role in roles:
        cursor.execute("INSERT INTO Role (role_name) VALUES (%s)", (role,))
    cnx.commit()
    print("Roles inserted")

    role_ids = {}
    cursor.execute("SELECT role_id, role_name FROM Role")
    for (role_id, role_name) in cursor:
        role_ids[role_name] = role_id
    print("Role IDs fetched:", role_ids)

    # Define the number of users for each role
    parent_count = 100  # Adjust this to the number of parents you want
    driver_count = 10  # Set to 10 drivers as you require 10 buses
    teacher_count = 10  # Set to 10 teachers

    # Chèn dữ liệu vào bảng User với password và refreshToken
    user_ids = []
    role_distribution = ['Parent'] * parent_count + ['Driver'] * driver_count + ['Teacher'] * teacher_count

    for role in role_distribution:
        name = fake.name()
        phone_number = fake.phone_number()
        email = f"{name.replace(' ', '').lower()}@example.com"
        refresh_token = generate_fake_refresh_token()

        # Insert user with the assigned role
        cursor.execute(
            "INSERT INTO User (name, phone_number, email, role_id, password, refresh_token) VALUES (%s, %s, %s, %s, %s, %s)",
            (name, phone_number, email, role_ids[role], hashed_password, refresh_token)
        )
        user_ids.append(cursor.lastrowid)

    # Commit changes to the database
    cnx.commit()
    print("Users inserted")

    # Keep track of feedback entries for each Parent, Driver, and Teacher
    feedback_titles = ['Great Service', 'Needs Improvement', 'Satisfied', 'Complaint', 'Feedback']
    ### NEW: Insert Only 10 Random Feedback Entries ###
    for _ in range(10):  # Only generate 10 feedback entries
        # Randomly select a user_id from the list of user_ids
        user_id = random.choice(user_ids)

        # Generate random feedback data
        title = random.choice(feedback_titles)
        content = fake.text(max_nb_chars=255)
        status = random.choice(['unsolved', 'solved'])  # Randomly assign 'unsolved' or 'solved'

        # Insert feedback data for the randomly selected user
        cursor.execute("INSERT INTO Feedback (user_id, title, content, status) VALUES (%s, %s, %s, %s)",
                       (user_id, title, content, status))
    # Commit the feedback entries to the database
    cnx.commit()
    print("10 Feedback entries inserted for random users.")

    # Insert Parents, Drivers, and Teachers based on roles
    parent_ids = []
    driver_ids = []
    teacher_ids = []

    for user_id in user_ids:
        cursor.execute("SELECT role_id FROM User WHERE user_id = %s", (user_id,))
        role_id = cursor.fetchone()[0]

        if role_id == role_ids['Parent']:
            address = fake.address().replace('\n', ', ')
            relationship = fake.random_element(
                elements=['Father', 'Mother', 'Other'])  # Randomly assign the relationship
            cursor.execute("INSERT INTO Parent (address, user_id, relationship) VALUES (%s, %s, %s)",
                           (address, user_id, relationship))
            parent_ids.append(cursor.lastrowid)

        elif role_id == role_ids['Driver']:
            license_number = f"{random.randint(100000000, 999999999)}-{random.randint(100, 999)}"
            cursor.execute("INSERT INTO Driver (license_number, user_id) VALUES (%s, %s)", (license_number, user_id))
            driver_ids.append(cursor.lastrowid)

        elif role_id == role_ids['Teacher']:
            department = fake.random_element(elements=['Mathematics', 'Literature', 'English'])
            cursor.execute("INSERT INTO Teacher (department, user_id) VALUES (%s, %s)", (department, user_id))
            teacher_ids.append(cursor.lastrowid)

    # Commit the parent, driver, and teacher entries to the database
    cnx.commit()
    print("Parents, Drivers, and Teachers inserted")

    # Inserting students and assigning them to classes and parents (no bus_id needed)
    student_ids = []
    class_students = {}

    for _ in range(60):
        name = fake.name()

        # Generate class_name in the format 'XaY', where X is the grade and Y is the class number
        grade = random.randint(1, 3)  # Adjust for the range of grades
        class_number = random.randint(1, 6)  # Adjust for the number of classes in each grade
        class_name = f"{grade}a{class_number}"  # Format as 'XaY' (e.g., '1a1', '2a3', etc.)

        if class_name not in class_students:
            class_students[class_name] = []

        avatar = generate_base64_avatar()
        feature_vector = generate_feature_vector()

        cursor.execute(
            "INSERT INTO Student (name, class, bus_id, avatar, feature_vector) VALUES (%s, %s, null, %s, %s)",
            (name, class_name, avatar, feature_vector))

        student_id = cursor.lastrowid
        student_ids.append(student_id)
        class_students[class_name].append(student_id)

    cnx.commit()
    print("Students inserted will null teacher_id.")

    # Track parents that have already been assigned
    assigned_parents = set()  # To ensure no parent is assigned to more than one student
    parent_with_two_students = False

    for student_id in student_ids:
        # Randomly assign 1 or 2 parents to each student, ensuring no parent is reused
        num_parents = random.randint(1, 2)  # A student can have 1 or 2 parents
        available_parents = [pid for pid in parent_ids if pid not in assigned_parents]  # Only unassigned parents

        # Ensure there are enough available parents to assign
        if len(available_parents) < num_parents:
            raise ValueError("Not enough unique parents to assign")

        # Randomly pick the required number of parents from the available ones
        selected_parents = random.sample(available_parents, num_parents)

        # Insert parent-student relationships, ensuring each parent is only assigned to one student
        for parent_id in selected_parents:
            cursor.execute(
                "INSERT INTO Student_Parent (student_id, parent_id) VALUES (%s, %s)",
                (student_id, parent_id)
            )
            # Mark the parent as assigned
            assigned_parents.add(parent_id)

        # Check if the special case (1 parent with 2 students) has been created
        if not parent_with_two_students and len(available_parents) > 1:
            # Pick one parent and assign them to another student (special case)
            shared_parent = random.choice(selected_parents)

            # Find another student to share this parent (other than the current student)
            another_student_id = random.choice([sid for sid in student_ids if sid != student_id])

            # Insert the special case where 1 parent has 2 students
            cursor.execute(
                "INSERT INTO Student_Parent (student_id, parent_id) VALUES (%s, %s)",
                (another_student_id, shared_parent)
            )

            # Mark that the special case is handled
            parent_with_two_students = True

    # Commit the parent-student relationships
    cnx.commit()
    print("Relationships between students and parents inserted into Student_Parent table.")

    # Step 2: Create buses without assigning teacher_id yet
    bus_ids = []
    remaining_students = len(student_ids)
    capacities = [16, 29]
    used_buses = 0

    for i, driver_id in enumerate(driver_ids):
        license_plate = fake.bothify(text='??-#####')
        latitude = fake.latitude()
        longitude = fake.longitude()
        current_location = f"POINT({latitude} {longitude})"

        # Dynamically assign the status based on remaining students
        if remaining_students > 0:
            capacity = random.choice(capacities)
            status = 'ongoing'  # Nếu còn học sinh thì xe buýt hoạt động
            used_buses += 1
            remaining_students -= capacity  # Giảm số lượng học sinh cần vận chuyển
        else:
            capacity = random.choice(capacities)
            status = 'stopped'  # Nếu không còn học sinh thì xe buýt dừng lại

        # Insert the bus into the database without teacher_id
        cursor.execute(
            "INSERT INTO Bus (license_plate, driver_id, current_location, status, capacity) VALUES (%s, %s, ST_GeomFromText(%s), %s, %s)",
            (license_plate, driver_id, current_location, status, capacity))
        bus_ids.append(cursor.lastrowid)

    # Commit the buses to the database
    cnx.commit()
    print(f"Buses inserted: {used_buses} ongoing, {len(driver_ids) - used_buses} stopped.")

    # random.shuffle(teacher_ids)
    for i, bus_id in enumerate(bus_ids):
        teacher_id = teacher_ids[i]  # Assign one teacher to one bus
        cursor.execute("UPDATE Bus SET teacher_id = %s WHERE bus_id = %s", (teacher_id, bus_id))

    # Commit the teacher assignments to the buses
    cnx.commit()
    print("Each teacher has been assigned to exactly one bus.")

    journey_ids = []
    used_bus_ids = set()

    # Fetch ongoing buses dynamically from the database
    cursor.execute("SELECT bus_id, capacity FROM Bus WHERE status = 'ongoing'")
    ongoing_buses = cursor.fetchall()  # Fetch bus_id and capacity for ongoing buses

    # Number of days in the past for generating historical journeys
    past_days = 2  # Generate historical data for the n days

    completed_journeys = []
    ongoing_journeys = []

    # Create completed journeys for the past days in ascending order (from past to present)
    for day in reversed(range(1, past_days + 1)):  # Reverse to start from the oldest day
        historical_date = datetime.datetime.now() - datetime.timedelta(days=day)

        # Create 3 morning journeys, all starting at 7:00 AM
        for _ in range(3):
            start_time = historical_date.replace(hour=7, minute=0, second=0)

            # Completed journey
            status = 'completed'
            duration_minutes = random.randint(30, 45)
            end_time = start_time + datetime.timedelta(minutes=duration_minutes)

            # Choose a random bus for completed journeys
            bus_id = fake.random_element([bus_id for bus_id, _ in ongoing_buses])

            # Append journey data
            completed_journeys.append((start_time, end_time, bus_id, status))

        # Create 3 afternoon journeys, with random start time at either 4:30 PM or 5:30 PM
        for _ in range(3):
            afternoon_start_time = random.choice([16, 17])  # Choose either 4:30 PM or 5:30 PM
            start_time = historical_date.replace(hour=afternoon_start_time, minute=30, second=0)

            # Completed journey
            status = 'completed'
            duration_minutes = random.randint(30, 45)
            end_time = start_time + datetime.timedelta(minutes=duration_minutes)

            # Choose a random bus for completed journeys
            bus_id = fake.random_element([bus_id for bus_id, _ in ongoing_buses])

            # Append journey data
            completed_journeys.append((start_time, end_time, bus_id, status))

    # Insert completed journeys into the database in ascending order (oldest first)
    for journey in completed_journeys:
        cursor.execute("INSERT INTO Journey (start_time, end_time, bus_id, status) VALUES (%s, %s, %s, %s)", journey)
        journey_ids.append(cursor.lastrowid)

    # Create and insert ongoing journeys for the current day (based on dynamic student data)
    for bus_id, bus_capacity in ongoing_buses:
        start_time = datetime.datetime.now().replace(hour=8, minute=0, second=0) if random.choice([True, False]) else \
            datetime.datetime.now().replace(hour=16, minute=30, second=0)

        # Ongoing journey
        status = 'ongoing'
        end_time = None  # Ongoing journeys have no end time

        # Insert ongoing journeys into the database last (current day)
        cursor.execute("INSERT INTO Journey (start_time, end_time, bus_id, status) VALUES (%s, %s, %s, %s)",
                       (start_time, end_time, bus_id, status))
        journey_ids.append(cursor.lastrowid)

    # Commit journey data
    cnx.commit()

    print("Journeys inserted, with historical journeys first (ascending order) and ongoing journeys last.")


    # Sample URLs for demo purposes
    def generate_sample_url(image_type, student_id):
        return f"https://example.com/{image_type}/{student_id}.jpg"


    # Insert attendance based on bus capacity dynamically for ongoing journeys
    for journey_id in journey_ids:
        # Get bus capacity and end_time for the journey
        cursor.execute("""
            SELECT Bus.capacity, Journey.end_time
            FROM Journey
            JOIN Bus ON Journey.bus_id = Bus.bus_id
            WHERE Journey.journey_id = %s
        """, (journey_id,))
        result = cursor.fetchone()
        bus_capacity = int(result[0])  # Either 16 or 29 seats
        end_time = result[1]  # Can be None for ongoing journeys

        # Ensure there are enough students to match the bus capacity
        if len(student_ids) >= bus_capacity:
            # Sample the students based on the bus capacity
            journey_students = random.sample(student_ids, bus_capacity)
        else:
            # If fewer students are available than bus capacity, use all available students
            journey_students = student_ids[:]

        # Further processing for journey_students
        print(f"Assigning {len(journey_students)} students to the bus (Capacity: {bus_capacity})")

        # Insert attendance based on bus capacity
        journey_students = random.sample(student_ids, bus_capacity)

        # Process ongoing journeys
        if end_time is None:  # Ongoing journey
            half_capacity = bus_capacity // 2  # 50% boarded, 50% alighted
            boarded_students = journey_students[:half_capacity]  # First half for boarded
            alighted_students = journey_students[half_capacity:]  # Second half for alighted

            for student_id in journey_students:
                cursor.execute("SELECT start_time FROM Journey WHERE journey_id = %s", (journey_id,))
                start_time = cursor.fetchone()[0]

                boarded = start_time + datetime.timedelta(minutes=random.randint(0, 10))  # boarded close to start_time

                if student_id in boarded_students:
                    # Mark as boarded
                    alighted = None
                    status = 'boarded'
                else:
                    # Mark as alighted
                    alighted = boarded + datetime.timedelta(minutes=random.randint(15, 30))
                    # Ensure alighted time doesn't exceed the current time
                    if alighted > datetime.datetime.now():
                        alighted = None
                    status = 'alighted' if alighted else 'boarded'

                # Insert attendance record into the database
                cursor.execute(
                    "INSERT INTO Attendance (student_id, journey_id, boarded, alighted, status) VALUES (%s, %s, %s, %s, %s)",
                    (student_id, journey_id, boarded, alighted, status))

        else:  # Completed journey
            # Process completed journeys
            for student_id in journey_students:
                cursor.execute("SELECT start_time FROM Journey WHERE journey_id = %s", (journey_id,))
                start_time = cursor.fetchone()[0]

                boarded = start_time + datetime.timedelta(minutes=random.randint(0, 10))
                alighted = boarded + datetime.timedelta(minutes=random.randint(30, 60)) if boarded < end_time else None

                # For completed journeys, mark students who haven't alighted as 'not alighted'
                if alighted is None and end_time <= datetime.datetime.now():
                    status = 'not alighted'
                elif alighted is not None and end_time <= datetime.datetime.now():
                    status = 'completed'
                else:
                    status = 'boarded'

                # Insert attendance record into the database
                cursor.execute(
                    "INSERT INTO Attendance (student_id, journey_id, boarded, alighted, status) VALUES (%s, %s, %s, %s, %s)",
                    (student_id, journey_id, boarded, alighted, status))

        # Commit changes to the database after processing each journey
        cnx.commit()

    print("Attendance records inserted, handling both ongoing and completed journeys with correct statuses.")

    # Fetch all attendance records to get the student and their journey_id
    cursor.execute("""
        SELECT student_id, journey_id
        FROM Attendance
    """)
    attendance_records = cursor.fetchall()  # Fetch all attendance data with student_id and journey_id

    # Process each attendance record
    for record in attendance_records:
        student_id = record[0]  # Get student_id from the attendance record
        journey_id = record[1]  # Get journey_id from the attendance record

        # Fetch the bus_id for the student, based on ongoing status
        cursor.execute("""
            SELECT Bus.bus_id
            FROM Journey
            JOIN Bus ON Journey.bus_id = Bus.bus_id
            WHERE Journey.journey_id = %s AND Bus.status = 'ongoing'
        """, (journey_id,))
        bus_info = cursor.fetchone()

        # If the bus is ongoing, assign it to the student
        if bus_info:
            bus_id = bus_info[0]

            # Assign the bus_id to the student (no need to clear previous assignment)
            cursor.execute("UPDATE Student SET bus_id = %s WHERE student_id = %s", (bus_id, student_id))
            print(f"Assigned bus {bus_id} to student {student_id}")
        else:
            print(f"No ongoing bus found for student_id {student_id} and journey_id {journey_id}")

    # Commit the updates to the database
    cnx.commit()
    print("Bus IDs updated for all students based on ongoing bus assignments.")

    # Fetch student names for notification messages
    cursor.execute("SELECT student_id, name FROM Student")
    student_names = {student_id: name for student_id, name in cursor.fetchall()}

    # Generate notifications for boarded, alighted, and not alighted
    cursor.execute("SELECT attendance_id, student_id, journey_id, boarded, alighted, status FROM Attendance")
    attendance_records = cursor.fetchall()

    for attendance_id, student_id, journey_id, boarded, alighted, status in attendance_records:
        name = student_names[student_id]

        # Fetch end_time from the journey
        cursor.execute("SELECT end_time FROM Journey WHERE journey_id = %s", (journey_id,))
        end_time = cursor.fetchone()[0]

        # Insert notification for 'boarded' status
        if boarded is not None:
            time_stamp = boarded  # Use boarded time for the notification timestamp
            message = f"{name} has boarded the bus."
            notification_status = 'common'
            boarded_image = generate_sample_url('boarded', student_id)

            # Insert boarded notification using alias
            cursor.execute("""
                INSERT INTO Notification (attendance_id, time_stamp, message, image, status) 
                VALUES (%s, %s, %s, %s, %s) AS new 
                ON DUPLICATE KEY UPDATE time_stamp = new.time_stamp, message = new.message
            """, (attendance_id, time_stamp, message, boarded_image, notification_status))

        # Insert notification for 'alighted' status
        if alighted is not None:
            time_stamp = alighted  # Use alighted time for the notification timestamp
            message = f"{name} has alighted from the bus."
            notification_status = 'common'
            alighted_image = generate_sample_url('alighted', student_id)

            # Insert alighted notification using alias
            cursor.execute("""
                INSERT INTO Notification (attendance_id, time_stamp, message, image, status) 
                VALUES (%s, %s, %s, %s, %s) AS new 
                ON DUPLICATE KEY UPDATE time_stamp = new.time_stamp, message = new.message
            """, (attendance_id, time_stamp, message, alighted_image, notification_status))

        # Insert notification for 'not alighted' status (alert)
        if status == 'not alighted':
            if end_time is not None:
                # Set time_stamp 5 to 10 minutes after the end_time
                time_stamp = end_time + datetime.timedelta(minutes=random.randint(5, 10))
            else:
                # If no end_time is available, use current time
                time_stamp = datetime.datetime.now()

            message = f"{name} did not alight from the bus."
            notification_status = 'alert'

            # Insert alert notification using alias
            cursor.execute("""
                INSERT INTO Notification (attendance_id, time_stamp, message, status) 
                VALUES (%s, %s, %s, %s) AS new 
                ON DUPLICATE KEY UPDATE time_stamp = new.time_stamp, message = new.message
            """, (attendance_id, time_stamp, message, notification_status))

    # Commit the changes
    cnx.commit()

    print(
        "Notifications inserted for boarded, alighted, and not alighted statuses, ensuring alert notifications for not alighted cases.")

    # Insert Admin role into the Role table (if not already present)
    cursor.execute("INSERT INTO Role (role_name) VALUES ('Admin')")
    cnx.commit()
    # Fetch the role_id for Admin role
    cursor.execute("SELECT role_id FROM Role WHERE role_name = 'Admin'")
    admin_role_id = cursor.fetchone()[0]

    # Create an Admin user
    admin_name = "Admin User"
    admin_phone = "0909090909"
    admin_email = "admin@test.com"
    admin_password = bcrypt.hashpw('admin'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    admin_refresh_token = generate_fake_refresh_token()

    cursor.execute(
        "INSERT INTO User (name, phone_number, email, role_id, password, refresh_token) VALUES (%s, %s, %s, %s, %s, %s)",
        (admin_name, admin_phone, admin_email, admin_role_id, admin_password, admin_refresh_token)
    )
    cnx.commit()
    print("Admin user created")

except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Something is wrong with your user name or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    else:
        print(err)
else:
    cnx.close()
