document.addEventListener("DOMContentLoaded", function() {
    // 初始化地图，设定初始视图到巴伐利亚地区
    const map = L.map('map').setView([48.1351, 11.5820], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 隐藏详情部分，直到有具体数据时才显示
    document.querySelector('.details-section').style.display = 'none';

    // 搜索按钮点击事件处理
    document.getElementById('search-button').addEventListener('click', function() {
        const searchQuery = document.getElementById('search-input').value;
        const centuryFilter = document.getElementById('century-filter').value;

        // Debug: 检查输入的值是否正确
        console.log('Search Query:', searchQuery);
        console.log('Century Filter:', centuryFilter);

        // 发出GET请求，查询数据库
        fetch('search.php?name=' + searchQuery + '&century=' + centuryFilter)
        .then(response => response.json())
        .then(data => {
            // 清除之前的结果和地图标记
            document.getElementById('results').innerHTML = '';
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) map.removeLayer(layer);
            });

            // 如果没有结果，显示 "No results"
            if (data.length === 0) {
                document.getElementById('results').innerText = 'No results';
            } else {
                // 显示搜索结果并在地图上添加标记
                data.forEach(dramatist => {
                    // 创建一个人名链接
                    const listItem = document.createElement('a');
                    listItem.href = '#';
                    listItem.innerText = dramatist.name;
                    listItem.addEventListener('click', () => displayDetails(dramatist));
                    document.getElementById('results').appendChild(listItem);

                    // 在地图上添加一个标记
                    const marker = L.marker([dramatist.latitude, dramatist.longitude]).addTo(map);
                    marker.on('click', () => displayDetails(dramatist));
                });
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('results').innerText = 'Error fetching data';
        });
    });

    // 显示剧作家详情的函数
    function displayDetails(dramatist) {
        // 显示详情部分
        document.querySelector('.details-section').style.display = 'flex';

        // 更新页面的剧作家信息
        document.getElementById('person-name').innerText = dramatist.name;
        document.getElementById('person-dates').innerText = dramatist.birth_date + ' - ' + (dramatist.death_date || 'Present');
        document.getElementById('person-bio').innerText = dramatist.biography;
        document.getElementById('wikidata-link').href = 'https://www.wikidata.org/wiki/' + dramatist.qid;

        // 更新剧作家的图片和图片元数据
        if (dramatist.img_url) {
            document.getElementById('person-image').src = dramatist.img_url;
            document.getElementById('image-metadata').innerText = (dramatist.img_artist || 'Unknown artist') + ', ' + 
                                                                  (dramatist.img_date || 'Unspecified date') + ', ' +
                                                                  (dramatist.img_license || 'Unspecified license');
        } else {
            document.getElementById('person-image').src = '';
            document.getElementById('image-metadata').innerText = 'No image available';
        }
    }
});
