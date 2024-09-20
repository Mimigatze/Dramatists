<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dramatist";

// 创建数据库连接
$conn = new mysqli($servername, $username, $password, $dbname);

// 检查连接是否成功
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 获取GET参数并进行基本清理
$name = isset($_GET['name']) ? $_GET['name'] : '';
$century = isset($_GET['century']) ? $_GET['century'] : 'all';

// 准备基础SQL查询，使用预处理语句来防止SQL注入
$sql = "SELECT * FROM dramatist_img_metadada WHERE name LIKE ?";

// 初始化查询参数
$params = ["%$name%"];
$types = "s";  // 绑定参数类型，'s' 表示字符串

// 添加根据世纪筛选的逻辑
if ($century != 'all') {
    if ($century == '15th') {
        $start_year = 1400;
        $end_year = 1499;
    } elseif ($century == '16th') {
        $start_year = 1500;
        $end_year = 1599;
    } elseif ($century == '17th') {
        $start_year = 1600;
        $end_year = 1699;
    } elseif ($century == '18th') {
        $start_year = 1700;
        $end_year = 1799;
    } elseif ($century == '19th') {
        $start_year = 1800;
        $end_year = 1899;
    } elseif ($century == '20th') {
        $start_year = 1900;
        $end_year = 1999;
    } elseif ($century == '21st') {
        $start_year = 2000;
        $end_year = date('Y');  // 设置为当前年份
    } elseif ($century == 'unspecified') {
        // 若选择的是"unspecified"，添加条件查询NULL值
        $sql .= " AND birth_date IS NULL";
    }

    // 若不是"unspecified"，则根据世纪添加筛选条件
    if ($century != 'unspecified') {
        $sql .= " AND birth_date BETWEEN ? AND ?";
        $types .= "ss";  // 添加两个字符串类型的日期参数
        $params[] = "$start_year-01-01";
        $params[] = "$end_year-12-31";
    }
}

// 准备预处理语句
$stmt = $conn->prepare($sql);
if ($stmt === false) {
    die("Error preparing statement: " . $conn->error);
}

// 绑定参数
$stmt->bind_param($types, ...$params);

// 执行查询
$stmt->execute();
$result = $stmt->get_result();

// 将查询结果存入数组
$dramatists = [];
while ($row = $result->fetch_assoc()) {
    $dramatists[] = $row;
}

// 返回JSON格式的结果
echo json_encode($dramatists);

// 关闭数据库连接
$stmt->close();
$conn->close();
?>
