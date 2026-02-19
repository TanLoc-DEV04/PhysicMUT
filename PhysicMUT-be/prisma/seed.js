const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // --- 0. CLEANUP ---
    console.log('Cleaning up database...');
    await prisma.exercise.deleteMany({});
    await prisma.example.deleteMany({});
    await prisma.model3D.deleteMany({});
    await prisma.theory.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.chapter.deleteMany({});

    // UPSERT ROLES & USERS (Keep existing logic for roles/users)
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: { name: 'ADMIN', description: 'System Administrator', permissions: { all: true } }
    });
    const teacherRole = await prisma.role.upsert({
        where: { name: 'TEACHER' },
        update: {},
        create: { name: 'TEACHER', description: 'Teacher', permissions: { content: true } }
    });
    const studentRole = await prisma.role.upsert({
        where: { name: 'STUDENT' },
        update: {},
        create: { name: 'STUDENT', description: 'Student', permissions: { read: true } }
    });

    const adminPwd = '123456';
    await prisma.user.upsert({
        where: { email: 'admin@physicmut.com' },
        update: {},
        create: { username: 'admin', email: 'admin@physicmut.com', password_hash: adminPwd, full_name: 'Quản trị viên', role: { connect: { id: adminRole.id } } }
    });
    // ... similarly for teacher/student if needed, skipping for brevity as user implies existing correct setup or just wants content focus.
    // Actually, let's keep them to be safe.
    await prisma.user.upsert({
        where: { email: 'teacher@physicmut.com' },
        update: {},
        create: { username: 'teacher', email: 'teacher@physicmut.com', password_hash: '123456', full_name: 'Giáo viên Vật Lý', role: { connect: { id: teacherRole.id } } }
    });
    await prisma.user.upsert({
        where: { email: 'student@physicmut.com' },
        update: {},
        create: { username: 'student', email: 'student@physicmut.com', password_hash: '123456', full_name: 'Nguyễn Văn A', role: { connect: { id: studentRole.id } } }
    });


    // --- 1. CONTENT CREATION ---
    console.log('Creating 3 Models Content...');

    // Helper to create content
    const createModelContent = async (chapterName, lessonName, theories, modelData, examples, exercises) => {
        const chapter = await prisma.chapter.create({
            data: {
                name: chapterName,
                description: `Chương về ${chapterName}`,
                order: 1,
                lessons: {
                    create: [{
                        name: lessonName,
                        order: 1,
                        theories: { create: theories },
                        models3d: { create: [modelData] }, // 1:1 Model per user request implies 1 main model, but schema allows many. We put 1.
                        examples: { create: examples },
                        exercises: { create: exercises }
                    }]
                }
            }
        });
        console.log(`Created ${lessonName}`);
    };

    // 1. CYCLOTRON
    await createModelContent(
        'Điện từ trường',
        'Máy gia tốc Cyclotron',
        [{
            title: 'Lý thuyết mô hình Máy gia tốc hạt Cyclotron',
            content_html: `
<div class="cyclotron-theory">
    <h1 style="text-align: center; color: #2c3e50;">CHUYÊN ĐỀ: MÁY GIA TỐC HẠT CYCLOTRON (XICLÔTRÔN)</h1>

    <section>
        <h2 style="color: #e67e22;">1. Định nghĩa và Cấu tạo</h2>
        <p><strong>Định nghĩa:</strong> Cyclotron là một loại máy gia tốc hạt sử dụng phối hợp điện trường biến thiên và từ trường đều để tăng tốc cho các hạt mang điện (như proton, deuteron, hạt alpha...) di chuyển theo quỹ đạo tròn với bán kính tăng dần theo hình xoắn ốc [1, 2].</p>
        
        <p><strong>Cấu tạo chính:</strong></p>
        <ul>
            <li><strong>Hai hộp rỗng hình chữ D (Dees):</strong> Là hai điện cực kim loại rỗng hình chữ D, đặt đối diện nhau và cách nhau một khe hở hẹp [2, 3].</li>
            <li><strong>Từ trường đều (B):</strong> Toàn bộ hệ thống hộp D được đặt trong chân không giữa hai cực của nam châm điện mạnh. Cảm ứng từ B vuông góc với mặt phẳng của các hộp D [2, 3].</li>
            <li><strong>Nguồn điện xoay chiều (U<sub>~</sub>):</strong> Được nối vào hai hộp D để tạo ra điện trường biến thiên tần số cao tại khe hở giữa hai hộp [2].</li>
            <li><strong>Nguồn phát hạt:</strong> Đặt ở tâm của máy (khe hở) để phát ra các hạt mang điện cần gia tốc [1].</li>
        </ul>
    </section>

    <section>
        <h2 style="color: #e67e22;">2. Nguyên lý hoạt động</h2>
        <p>Quá trình gia tốc diễn ra theo chu trình sau:</p>
        <ol>
            <li><strong>Trong lòng hộp D:</strong> Bên trong hộp D là đẳng thế (không có điện trường). Hạt chỉ chịu tác dụng của <strong>lực Lo-ren-xơ</strong> do từ trường B gây ra. Hạt chuyển động tròn đều với bán kính <em>r</em> [1].</li>
            <li><strong>Tại khe hở:</strong> Khi hạt đi đến khe hở, điện trường giữa hai hộp D đổi chiều sao cho hạt được tăng tốc. Hạt nhận năng lượng từ điện trường, vận tốc <em>v</em> tăng lên [2].</li>
            <li><strong>Quỹ đạo xoắn ốc:</strong> Khi vận tốc tăng, bán kính quỹ đạo của hạt trong từ trường sẽ tăng theo (do <em>r ~ v</em>). Do đó, hạt di chuyển theo đường xoắn ốc từ tâm ra ngoài [2].</li>
            <li><strong>Dẫn ra ngoài:</strong> Khi hạt đạt đến bán kính cực đại (mép ngoài của hộp D), nó được dẫn ra khỏi máy qua một cửa sổ để sử dụng [2, 4].</li>
        </ol>
    </section>

    <section>
        <h2 style="color: #e67e22;">3. Các công thức quan trọng (Dùng cho thi THPT QG)</h2>
        <p>Giả sử hạt có khối lượng <em>m</em>, điện tích <em>q</em>, chuyển động trong từ trường đều <em>B</em>.</p>

        <h3>a. Lực Lo-ren-xơ (Lực hướng tâm)</h3>
        <p>Lực từ tác dụng lên hạt đóng vai trò là lực hướng tâm:</p>
        <p style="background-color: #f1f1f1; padding: 10px; border-left: 5px solid #3498db;">
            F = |q|vB = m(v<sup>2</sup> / r)
        </p>
        <p><em>Trong đó: v là vận tốc dài, r là bán kính quỹ đạo [1, 2].</em></p>

        <h3>b. Bán kính quỹ đạo (r)</h3>
        <p style="background-color: #f1f1f1; padding: 10px; border-left: 5px solid #3498db;">
            r = (mv) / (|q|B)
        </p>
        <p><em>Nhận xét:</em> Bán kính tỉ lệ thuận với vận tốc. Khi hạt được gia tốc, <em>v</em> tăng thì <em>r</em> tăng [2, 5].</p>

        <h3>c. Chu kỳ (T) và Tần số (f)</h3>
        <p>Đây là đại lượng quan trọng nhất chứng minh khả năng đồng bộ hóa của Cyclotron.</p>
        <ul>
            <li><strong>Chu kỳ quay:</strong> T = (2&pi;r) / v = (2&pi;m) / (|q|B)</li>
            <li><strong>Tần số Cyclotron:</strong> f = 1/T = (|q|B) / (2&pi;m)</li>
            <li><strong>Tần số góc:</strong> &omega; = (|q|B) / m</li>
        </ul>
        <p><strong>Lưu ý cực kỳ quan trọng:</strong> Chu kỳ và tần số quay <strong>không phụ thuộc</strong> vào vận tốc <em>v</em> và bán kính <em>r</em> (trong phạm vi phi tương đối tính). Điều này cho phép dùng nguồn điện xoay chiều có tần số không đổi để gia tốc hạt liên tục [5-7].</p>

        <h3>d. Động năng cực đại (W<sub>đmax</sub>)</h3>
        <p>Hạt đạt động năng cực đại khi ở mép ngoài cùng của hộp D (bán kính R<sub>max</sub> của máy):</p>
        <p style="background-color: #f1f1f1; padding: 10px; border-left: 5px solid #3498db;">
            v<sub>max</sub> = (|q|B R<sub>max</sub>) / m <br>
            W<sub>đmax</sub> = 0.5 * m * v<sub>max</sub><sup>2</sup> = (q<sup>2</sup> B<sup>2</sup> R<sub>max</sub><sup>2</sup>) / (2m)
        </p>
        <p><em>Nhận xét:</em> Động năng cực đại tỉ lệ với bình phương bán kính máy và bình phương cảm ứng từ, <strong>không phụ thuộc</strong> vào hiệu điện thế gia tốc <em>U</em> giữa hai bản cực [8].</p>

        <h3>e. Số vòng quay (N)</h3>
        <p>Giả sử hiệu điện thế giữa hai hộp D là <em>U</em>. Mỗi vòng quay hạt đi qua khe 2 lần, mỗi lần nhận năng lượng |q|U. Tổng động năng đạt được:</p>
        <p>W<sub>đmax</sub> = N * (2|q|U) &rArr; N = W<sub>đmax</sub> / (2|q|U)</p>
    </section>

    <section>
        <h2 style="color: #e67e22;">4. Ứng dụng thực tế</h2>
        <ul>
            <li><strong>Y học hạt nhân:</strong> Sản xuất đồng vị phóng xạ phục vụ chẩn đoán (PET/CT) và điều trị ung thư (Xạ trị hạt - Particle therapy) [9, 10].</li>
            <li><strong>Nghiên cứu vật lý:</strong> Tạo chùm hạt năng lượng cao để bắn phá hạt nhân, nghiên cứu cấu trúc vật chất [10].</li>
        </ul>
    </section>

    <section>
        <h2 style="color: #e67e22;">5. Các dạng câu hỏi thường gặp</h2>
        <ul>
            <li><strong>Dạng 1 - Điều kiện cộng hưởng:</strong> Tần số của nguồn điện xoay chiều phải bằng tần số quay của hạt: f<sub>điện</sub> = f<sub>hạt</sub> = (|q|B) / (2&pi;m) [7].</li>
            <li><strong>Dạng 2 - Yếu tố ảnh hưởng động năng cuối cùng:</strong> Chỉ phụ thuộc vào bán kính máy (R) và từ trường (B), không phụ thuộc vào hiệu điện thế U [8].</li>
            <li><strong>Dạng 3 - So sánh chu kỳ các hạt:</strong> Lập tỉ số T ~ m / |q|. Ví dụ: So sánh hạt Proton và hạt Alpha.</li>
        </ul>
    </section>

    <section>
        <h2 style="color: #e67e22;">6. Ví dụ minh họa</h2>
        <div style="border: 1px solid #ccc; padding: 15px; background-color: #fff9c4;">
            <p><strong>Bài toán:</strong> Một hạt proton có khối lượng 1,67 &times; 10<sup>-27</sup> kg và điện tích 1,6 &times; 10<sup>-19</sup> C chuyển động trong từ trường B = 1T. Tính chu kỳ quay.</p>
            <p><strong>Giải:</strong></p>
            <p>Áp dụng công thức: T = (2&pi;m) / (|q|B)</p>
            <p>T = (2 &times; 3,14 &times; 1,67 &times; 10<sup>-27</sup>) / (1,6 &times; 10<sup>-19</sup> &times; 1)</p>
            <p><strong>T &approx; 6,6 &times; 10<sup>-8</sup> (s)</strong></p>
        </div>
    </section>
</div>
            `,
            type: 'Theory',
            status: 'ACTIVE'
        }],
        {
            name: 'Cyclotron',
            description: 'Mô hình 3D Máy gia tốc Cyclotron',
            source_url: '', // Frontend uses `type` mainly, or we can put a dummy path.
            thumbnail_url: '/cyclotron.jpg',
            type: 'CYCLOTRON', // IMPORTANT: Matches ModelRegistry case
            status: 'ACTIVE'
        },
        [{
            title: 'Bài toán Cyclotron (Câu 6)',
            problem: `
<p>
    Máy cyclotron là một loại máy gia tốc hạt sử dụng từ trường và điện trường để tăng tốc các hạt tích điện theo quỹ đạo có bán kính tăng dần. Thiết bị này được ứng dụng rộng rãi trong y học hạt nhân và nghiên cứu vật lý hạt. Hình bên mô tả cấu tạo một máy cyclotron gồm có hai hộp rỗng hình chữ D (hai cực \\( D_1 \\) và \\( D_2 \\)) làm bằng đồng ghép với nhau thành một hình tròn được đặt trong chân không từ trường đều có cảm ứng từ \\( B \\) vuông góc với mặt hộp. Hai cạnh thẳng đứng của các hộp D không đặt sát nhau mà cách nhau một khoảng hẹp, ở giữa khoảng hẹp có một điện trường \\( E \\). Điện tích phóng ra ở gần tâm máy được tăng tốc trực tiếp bởi lực điện khi đi qua điện trường giữa hai hộp D. Xét chuyển động của hạt Deuteron trong một máy cyclotron khi nó đang ở cực \\( D_1 \\) và bay theo phương vuông góc với các đường sức từ, lực từ tác dụng lên hạt có độ lớn \\( F = Bv|q| \\), có phương vuông góc với cảm ứng từ \\( B \\) và vận tốc \\( v \\) của hạt, cho tốc độ của hạt khi đó là \\( 3,2 \\cdot 10^6 \\text{ m/s} \\). Biết Deuteron có khối lượng là \\( m = 3,31 \\cdot 10^{-27} \\text{ kg} \\) và điện tích \\( q = +1,6 \\cdot 10^{-19} \\text{ C} \\). Hiệu điện thế giữa hai cực \\( D_1, D_2 \\) là \\( 100 \\text{ kV} \\) và độ lớn cảm ứng từ \\( B \\) là \\( 2,0 \\text{ T} \\). Lấy \\( \\pi = 3,14 \\) trong các phép tính có dùng đến số \\( \\pi \\). Sau 150 lần (kể từ lúc bắt đầu chuyển động của Deuteron) tăng tốc bởi điện trường thì bán kính quỹ đạo của Deuteron là bao nhiêu cm (kết quả làm tròn đến hàng phần mười).
</p>
            `,
            solution: `
<h1>Lời Giải: Bài Toán Máy Gia Tốc Cyclotron (Câu 6)</h1>

    <h3>1. Tóm tắt dữ kiện đề bài</h3>
    <ul>
        <li><strong>Hạt:</strong> Deuteron ($D$).</li>
        <li><strong>Khối lượng:</strong> $m = 3,31 \\cdot 10^{-27} \\text{ kg}$.</li>
        <li><strong>Điện tích:</strong> $q = +1,6 \\cdot 10^{-19} \\text{ C}$.</li>
        <li><strong>Vận tốc đầu:</strong> $v_0 = 3,2 \\cdot 10^6 \\text{ m/s}$.</li>
        <li><strong>Từ trường:</strong> $B = 2,0 \\text{ T}$.</li>
        <li><strong>Hiệu điện thế tăng tốc:</strong> $U = 100 \\text{ kV} = 100.000 \\text{ V} = 10^5 \\text{ V}$.</li>
        <li><strong>Số lần tăng tốc:</strong> $N = 150$ lần.</li>
    </ul>

    <hr>

    <h3>2. Phân tích hiện tượng vật lý</h3>
    <p>Theo bài giảng của giáo viên, quá trình chuyển động của hạt trong máy Cyclotron chia làm 2 giai đoạn chính:</p>
    <ul>
        <li><strong>Trong hộp D (Từ trường $B$):</strong> Hạt chịu tác dụng của lực Lorenxo ($F = |q|vB$). Lực này đóng vai trò lực hướng tâm, làm hạt chuyển động tròn đều nhưng <em>không sinh công</em> (tốc độ không đổi).</li>
        <li><strong>Tại khe hở giữa 2 hộp D (Điện trường $E$):</strong> Hạt chịu tác dụng của lực điện. Mỗi lần hạt đi qua khe hở này, điện trường sẽ thực hiện một công dương làm hạt tăng tốc.</li>
    </ul>

    <div class="box-highlight">
        <strong>Nguyên lý tăng tốc:</strong>
        <br>
        Mỗi lần đi qua khe hở, động năng của hạt tăng thêm một lượng: $\\Delta W_d = |q|U$.
        <br>
        Sau $N$ lần đi qua khe hở, tổng động năng tăng thêm là: $N \\cdot |q|U$.
    </div>

    <hr>

    <h3>3. Quy trình tính toán chi tiết</h3>

    <h4>Bước 1: Áp dụng định lý biến thiên động năng</h4>
    <p>Động năng lúc sau ($W_{d\\_sau}$) trừ động năng ban đầu ($W_{d\\_dau}$) bằng tổng công của lực điện sau $N$ lần tăng tốc:</p>
    $$ W_{d\\_sau} - W_{d\\_dau} = N \\cdot |q|U $$
    $$ \\Rightarrow \\frac{1}{2}mv_N^2 - \\frac{1}{2}mv_0^2 = N \\cdot |q|U $$

    <h4>Bước 2: Tính vận tốc hạt sau 150 lần tăng tốc ($v_N$)</h4>
    <p>Từ công thức trên, ta rút ra $v_N$:</p>
    $$ \\frac{1}{2}mv_N^2 = \\frac{1}{2}mv_0^2 + N|q|U $$
    $$ \\Rightarrow v_N = \\sqrt{v_0^2 + \\frac{2N|q|U}{m}} $$

    <p>Thay số vào biểu thức:</p>
    $$ v_N = \\sqrt{(3,2 \\cdot 10^6)^2 + \\frac{2 \\cdot 150 \\cdot (1,6 \\cdot 10^{-19}) \\cdot (10^5)}{3,31 \\cdot 10^{-27}}} $$
    
    <p><em>(Bấm máy tính phần phân số trước rồi cộng với bình phương vận tốc đầu)</em></p>
    $$ v_N \\approx \\sqrt{10,24 \\cdot 10^{12} + 1450,15 \\cdot 10^{12}} \\approx \\sqrt{1460,39 \\cdot 10^{12}} $$
    $$ v_N \\approx 38,215 \\cdot 10^6 \\text{ m/s} = 3,82 \\cdot 10^7 \\text{ m/s} $$

    <h4>Bước 3: Tính bán kính quỹ đạo cuối cùng ($R$)</h4>
    <p>Khi hạt chuyển động tròn trong từ trường với vận tốc $v_N$, lực Lorenxo là lực hướng tâm:</p>
    $$ |q|v_NB = \\frac{mv_N^2}{R} \\Rightarrow R = \\frac{m \\cdot v_N}{|q|B} $$

    <p>Thay số:</p>
    $$ R = \\frac{(3,31 \\cdot 10^{-27}) \\cdot (3,82 \\cdot 10^7)}{(1,6 \\cdot 10^{-19}) \\cdot 2,0} $$
    $$ R \\approx \\frac{12,644 \\cdot 10^{-20}}{3,2 \\cdot 10^{-19}} \\approx 3,951 \\cdot 10^{-1} \\text{ m} $$
    
    <p>Đổi đơn vị sang cm ($1 \\text{ m} = 100 \\text{ cm}$):</p>
    $$ R \\approx 0,3951 \\text{ m} = 39,51 \\text{ cm} $$

    <div class="box-highlight">
        <strong>Kết quả cuối cùng (làm tròn đến hàng phần mười):</strong>
        <br>
        <span class="result">R ≈ 39,5 cm</span>
    </div>
            `,
            type: 'Calculation',
            status: 'ACTIVE'
        }],
        [
            // PROBLEM 1 & 2 (Identical in text, mapped as one)
            {
                question: `
<p> Xiclôtrôn là máy gia tốc gồm hai hộp rỗng bằng kim loại hình chữ D, cách nhau một khe (hình vẽ). Có một từ trường với cảm ứng từ vectơ B không đổi vuông góc với mặt hộp. Gần tâm của hai hộp đó có nguồn phát ra hạt tích điện dương với vectơ vận tốc v vuông góc với vectơ B. Biết khối lượng <em>m</em> và điện tích <em>q</em> của hạt.</p>

<p><strong>a)</strong> Chứng minh rằng quỹ đạo của hạt trong từ trường là đường tròn. Tính bán kính đường tròn này.</p>

<p><strong>b)</strong> Có một hiệu điện thế xoay chiều đặt vào hai hộp D với tần số thích hợp để hạt được tăng tốc mỗi lần đi qua khe. Quỹ đạo của hạt gần giống đường xoắn ốc. Chính xác thì quỹ đạo ấy có dạng như thế nào?</p>

<p><strong>c)</strong> Tính tần số quay của hạt, cho nhận xét về tần số này. Tần số của điện áp xoay chiều phải bằng bao nhiêu để hạt được tăng tốc mỗi lần qua khe? Trong phần dưới đây, xét trường hợp gia tốc hạt prôtôn có khối lượng $m_p = 1,66 \\cdot 10^{-27} \\text{ kg}$ và điện tích $e = 1,6 \\cdot 10^{-19} \\text{C}$. Điện áp đặt vào các hộp D có tần số $f = 10^{17} \\text{ Hz}$. Vòng cuối cùng của prôtôn trước khi ra khỏi xiclôtrôn có bán kính 0,42 m.</p>

<p><strong>d)</strong> Tính cảm ứng từ B và động năng cuối cùng của prôtôn.</p>

<p><strong>e)</strong> Cực đại của điện áp giữa các hộp D là 20 kV. Tính số vòng mà prôtôn đã quay trước khi ra khỏi xiclôtrôn.</p>
                `,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đáp án đang được cập nhật'
            },
            // PROBLEM 3 (Context + 3 Multiple Choice Questions)
            {
                question: `
<p><em>Sử dụng các thông tin sau cho Câu I, Câu II và Câu III:</em> Một máy gia tốc cyclotron dùng để tăng tốc electron, hai hộp kim loại hình chữ D được kết nối với hai cực của nguồn điện xoay chiều tần số cao. Hai hộp được đặt trong một từ trường đều có cảm ứng từ <em>B</em>. Hướng của từ trường vuông góc với đáy hộp và hướng xuống dưới. Hiệu điện thế giữa hai hộp hình chữ D luôn có độ lớn là <em>U</em> và nguồn electron được đặt gần tâm hộp. Biết electron có vận tốc ban đầu không đáng kể, khối lượng là <em>m</em>, độ lớn điện tích là <em>e</em> và bán kính cyclotron cực đại của nó là <em>R</em>.</p>

<p><strong>Câu I.</strong> Tần số của nguồn điện xoay chiều là</p>
<ul>
    <li>A. $\\frac{2\\pi m}{eB}$</li>
    <li>B. $\\frac{eB}{2\\pi m}$</li>
    <li>C. $\\frac{\\pi m}{eB}$</li>
    <li>D. $\\frac{eB}{\\pi m}$</li>
</ul>

<p><strong>Câu II.</strong> Tốc độ cực đại của electron khi rời khỏi máy là</p>
<ul>
    <li>A. $\\frac{m}{eBR}$</li>
    <li>B. $\\frac{mR}{eB}$</li>
    <li>C. $\\frac{eBR}{m}$</li>
    <li>D. $\\frac{eB}{mR}$</li>
</ul>

<p><strong>Câu III.</strong> Nếu chỉ tăng <em>U</em> thì</p>
<ul>
    <li>A. Động năng cực đại của hạt tăng.</li>
    <li>B. Thời gian để hạt đạt động năng cực đại tăng.</li>
    <li>C. Động năng cực đại của hạt giảm.</li>
    <li>D. Thời gian để hạt đạt động năng cực đại giảm.</li>
</ul>
                `,
                options: [],
                correct_answer: "",
                level: 'MEDIUM',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đáp án đang được cập nhật'
            },
            // PROBLEM 4
            {
                question: `
<p> Hai hạt khác nhau được tăng tốc bằng máy gia tốc cyclotron. Độ lớn cảm ứng từ của từ trường vuông góc với mặt hộp D không đổi, tần số của điện áp xoay chiều có thể điều chỉnh theo tần số chuyển động tròn của hai hạt.</p> <ul> <li>A. Hạt có điện tích lớn hơn có động lượng cuối cùng lớn hơn.</li> <li>B. Hạt có điện tích nhỏ hơn có động lượng cuối cùng lớn hơn.</li> <li>C. Hạt có điện tích lớn hơn có động năng cuối cùng lớn hơn.</li> <li>D. Hạt có điện tích nhỏ hơn có động năng cuối cùng lớn hơn.</li> </ul>
                `,
                options: [{ id: "A", text: "A" }, { id: "B", text: "B" }, { id: "C", text: "C" }, { id: "D", text: "D" }], // Simplified options
                correct_answer: "",
                level: 'MEDIUM',
                type: 'MultipleChoice',
                status: 'ACTIVE',
                reference: 'Đáp án đang được cập nhật'
            },
            // PROBLEM 5
            {
                question: `
<p>Một máy gia tốc cyclotron có bán kính của hộp hình chữ D là <em>R</em>. Từ trường đều hướng vuông góc với mặt hộp có độ lớn cảm ứng từ <em>B</em>. Hiệu điện thế giữa hai hộp luôn có độ lớn là <em>U</em> được sử dụng để tăng tốc các proton có khối lượng <em>m</em> và điện tích <em>e</em>. Các proton xuất phát từ trạng thái nghỉ tại tâm hộp hình chữ D và sau khi được tăng tốc nhiều lần, chúng bị kéo ra khỏi mép hộp hình chữ D. Bỏ qua thời gian tăng tốc của proton trong điện trường và không xét đến các hiệu ứng tương đối tính và trọng lực của các hạt.</p> <p><strong>a)</strong> Mỗi chu kì, proton được tăng tốc một lần.<br> <strong>b)</strong> Tần số của điện áp xoay chiều là $\\frac{eB}{\\pi m}$.<br> <strong>c)</strong> Động năng cực đại mà một proton có thể đạt được là $\\frac{e^2 B^2 R^2}{2m}$.<br> <strong>d)</strong> Tổng thời gian mà proton chuyển động trong máy gia tốc là $\\frac{\\pi B R^2}{2U}$.</p>
                `,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đáp án đang được cập nhật'
            },
            // PROBLEM 6
            {
                question: `
<p> Sử dụng máy gia tốc như hình bên để tăng tốc một hạt có độ lớn điện tích <em>q</em> và khối lượng <em>m</em>. Biết rằng bán kính của hộp hình chữ D là <em>R</em>, độ lớn cảm ứng từ của từ trường đặt vào là <em>B</em>, hiệu điện thế giữa a và b có độ lớn <em>U</em>, bỏ qua chiều rộng khe hở giữa hai hộp hình chữ D.</p> <p><strong>a)</strong> Năng lượng của hạt được cung cấp bởi điện trường tăng tốc và động năng cực đại có thể thu được liên quan đến hiệu điện thế <em>U</em>.<br> <strong>b)</strong> Chu kì của hiệu điện thế xoay chiều đặt vào a và b là $\\frac{2\\pi m}{qB}$.<br> <strong>c)</strong> Tốc độ cực đại của hạt được gia tốc trong máy là $\\frac{qBR}{m}$.<br> <strong>d)</strong> Nếu hiệu điện thế <em>U</em> tăng thì tổng thời gian hạt chuyển động trong máy sẽ dài hơn.</p>
                `,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đáp án đang được cập nhật'
            },
            // PROBLEM 7
            {
                question: `
<p>Để nghiên cứu và ứng dụng các hạt vật chất nhỏ hơn nguyên tử, người ta thường sử dụng máy cyclotron (hình vẽ). Máy này hoạt động dựa trên nguyên tắc kết hợp điện trường và từ trường để làm tăng tốc các hạt điện tích chuyển động. Máy cyclotron có hai hộp rỗng hình chữ D (hai cực $D_1$ và $D_2$) làm bằng đồng ghép với nhau thành một hình tròn được đặt trong chân không có từ trường đều sao cho cảm ứng từ $\\vec{B}$ vuông góc với mặt hộp. Hai cạnh thẳng đứng của các hộp D không đặt sát nhau mà cách nhau một khoảng hẹp, ở giữa khoảng hẹp có một điện trường đều có cường độ $\\vec{E}$. Điện tích phóng ra ở gần tâm máy được tăng tốc trực tiếp bởi lực điện khi đi qua điện trường giữa hai hộp D và được lực từ làm cho chuyển động tròn trong hộp. Vì điện tích được tăng tốc dần nên bán kính quỹ đạo cũng tăng theo. Xét chuyển động của hạt deuterium trong một máy cyclotron. Biết deuterium có khối lượng nghỉ là $3,31 \\cdot 10^{-27} \\text{ kg}$ và điện tích $+1,6 \\cdot 10^{-19} \\text{ C}$, bay theo phương vuông góc với các đường sức từ với tốc độ $3,2 \\cdot 10^6 \\text{ m/s}$ (ở cực $D_1$). Lực từ tác dụng lên hạt điện tích có độ lớn $f = B \\cdot v \\cdot |q|$, có phương vuông góc với cảm ứng từ $\\vec{B}$ và với vận tốc $\\vec{v}$ của hạt. Hiệu điện thế giữa hai cực D là $100 \\text{ kV}$ và độ lớn cảm ứng từ B là $1,6 \\text{ T}$. Biết deuterium bay ra khỏi các cực theo phương song song với các đường sức điện của điện trường giữa hai cực.</p> <p><strong>a)</strong> Tốc độ của hạt bị thay đổi do tác dụng của điện trường giữa hai hộp D.<br> <strong>b)</strong> Bán kính quỹ đạo chuyển động của deuterium trong từ trường ở cực $D_1$ (lúc ban đầu) bằng $4,1375 \\text{ cm}$.<br> <strong>c)</strong> Bán kính của quỹ đạo của deuterium trong từ trường ở cực $D_2$ (sau lần tăng tốc thứ nhất) xấp xỉ bằng $5,8 \\text{ cm}$.<br> <strong>d)</strong> Nếu bán kính của cyclotron là $50 \\text{ cm}$ thì hạt deuterium được tăng tốc bởi điện trường 189 lần so với lúc đầu.</p>
                `,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đáp án đang được cập nhật'
            },
            // PROBLEM 8
            {
                question: `
<p>Nguyên lý hoạt động của máy cyclotron, dùng để tăng tốc hạt mang điện như hình bên. Hai hộp rỗng I, II hình chữ D làm bằng đồng lá, hở ở phía cạnh thẳng, rất gần nhau, gọi là hai cực D. Giữa hai cạnh thẳng của hai cực có một điện trường, có thể đảo chiều nhờ dòng điện xoay chiều. Hai cực D đặt trong một từ trường độ lớn cảm ứng từ B (vách bằng đồng sẽ ngăn không cho điện trường xuyên vào hộp), có hướng vuông góc với mặt phẳng hình vẽ. Giả sử lúc đầu có một proton xuất phát từ một điểm rất gần với tâm S của máy cyclotron và đi vào hộp I đang mang điện âm. Lúc này, lực Lorentz xuất hiện và làm cho proton chuyển động theo quỹ đạo nửa đường tròn trong hộp I. Sau đó, khi proton quay lại cạnh thẳng của hộp I thì nguồn điện đổi chiều, điện trường sẽ tăng tốc cho proton, proton đi vào hộp II và lực Lorentz lại làm nhiệm vụ như trên, nhưng do vận tốc của proton đã tăng nên bán kính của nửa đường tròn quỹ đạo lúc này lớn hơn trước. Người ta đã chứng minh được rằng, thời gian chuyển động của proton bên trong các hộp luôn không đổi, vì vậy chỉ cần đặt nguồn điện xoay chiều có chu kỳ bằng hai lần thời gian chuyển động của proton trong các hộp D thì proton sẽ được tăng tốc nhiều lần và thu được vận tốc lớn. Đến mép ngoài hộp D, proton được phóng ra ngoài. Theo tính toán, bán kính quỹ đạo R của proton và tần số dao động $f_{dd}$ của dòng điện xoay chiều thỏa mãn các công thức: $R = \\frac{mv}{Bq}$ và $qB = 2\\pi m f_{dd}$, trong đó m, q, v là khối lượng, điện tích, tốc độ của proton. Cho biết $m = 1,67 \\cdot 10^{-27} \\text{ kg}$, $q = 1,6 \\cdot 10^{-19} \\text{ C}$. Một máy cyclotron hoạt động với $f_{dd} = 12 \\text{ MHz}$ và bán kính của hộp D là $53 \\text{ cm}$.</p> <p><strong>a)</strong> Lực tác dụng lên proton chỉ có lực từ.<br> <strong>b)</strong> Bán kính chuyển động của proton là không đổi.<br> <strong>c)</strong> Độ lớn của cảm ứng từ $B \\approx 0,787 \\text{ T}$ thì cyclotron có thể gia tốc được proton.<br> <strong>d)</strong> Năng lượng proton thu được khi ra khỏi máy là $8,3 \\text{ MeV}$.</p>
                `,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đáp án đang được cập nhật'
            }
        ]
    );

    // 2. LOUDSPEAKER (Loa điện động)
    await createModelContent(
        'Điện từ kỹ thuật',
        'Loa điện động',
        [{
            title: 'Lý thuyết mô hình Loa điện động',
            content_html: `
<div class="loudspeaker-theory" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto;">
    <h1 style="text-align: center; color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 10px;">CHUYÊN ĐỀ: LOA ĐIỆN ĐỘNG (DYNAMIC LOUDSPEAKER)</h1>

    <section>
        <h2 style="color: #2980b9;">1. Định nghĩa và Cấu tạo</h2>
        <p><strong>Định nghĩa:</strong> Loa điện động là một thiết bị biến đổi tín hiệu điện (dao động điện) thành tín hiệu âm thanh (dao động cơ học của sóng âm) có cùng tần số [1].</p>
        
        <p><strong>Cấu tạo chính:</strong></p>
        <ul>
            <li><strong>Nam châm vĩnh cửu (Magnet):</strong> Thường là nam châm hình tròn hoặc hình trụ, được cố định vào khung loa. Chức năng là tạo ra một từ trường mạnh và đều (B) trong khe từ (khe hở) [1], [2].</li>
            <li><strong>Cuộn dây (Voice Coil/Cuộn âm):</strong> Là một ống dây dẫn nhẹ, được đặt trong khe từ của nam châm nhưng không chạm vào nam châm. Dòng điện tín hiệu sẽ chạy qua cuộn dây này [1], [3].</li>
            <li><strong>Màng loa (Cone/Diaphragm):</strong> Gắn chặt với cuộn dây. Khi cuộn dây dao động, màng loa dao động theo để nén và giãn không khí, tạo ra sóng âm [1], [4].</li>
            <li><strong>Các bộ phận phụ trợ:</strong>
                <ul>
                    <li><em>Nhện loa (Spider) và Gân loa (Surround):</em> Giữ cho cuộn dây nằm chính giữa khe từ và giúp hệ thống đàn hồi trở về vị trí cân bằng [2], [5].</li>
                    <li><em>Nắp che bụi (Dust cap):</em> Chắn bụi bẩn rơi vào khe từ [3].</li>
                </ul>
            </li>
        </ul>
    </section>

    <section>
        <h2 style="color: #2980b9;">2. Nguyên lý hoạt động</h2>
        <p>Hoạt động của loa dựa trên <strong>tác dụng của từ trường lên dòng điện</strong> (Lực Lo-ren-xơ/Lực Ampère) [6].</p>
        <ol>
            <li><strong>Tín hiệu vào:</strong> Dòng điện xoay chiều (tín hiệu âm thanh) từ ampli chạy qua cuộn dây (Voice coil).</li>
            <li><strong>Tương tác từ:</strong> Cuộn dây mang dòng điện nằm trong từ trường của nam châm vĩnh cửu sẽ chịu tác dụng của lực từ. Chiều của lực tuân theo <em>Quy tắc bàn tay trái</em> [7].
                <ul>
                    <li>Khi dòng điện đổi chiều, chiều của lực từ cũng thay đổi (hướng ra hoặc hướng vào), làm cuộn dây dao động dọc theo trục.</li>
                </ul>
            </li>
            <li><strong>Tạo ra âm thanh:</strong> Cuộn dây gắn liền với màng loa nên màng loa cũng dao động theo với cùng tần số của dòng điện [8]. Màng loa nén và giãn lớp không khí tiếp xúc, tạo ra sóng dọc lan truyền ra môi trường [9].</li>
        </ol>
    </section>

    <section>
        <h2 style="color: #2980b9;">3. Các công thức quan trọng (Dùng cho thi THPT QG)</h2>
        
        <h3>a. Độ lớn lực từ (Lực đẩy/kéo màng loa)</h3>
        <p>Lực từ tác dụng lên cuộn dây khi có dòng điện chạy qua:</p>
        <div style="background-color: #f1f1f1; padding: 15px; border-left: 5px solid #27ae60; margin: 10px 0;">
            <strong>F = B &cdot; I &cdot; &ell;</strong>
        </div>
        <p><em>Trong đó:</em></p>
        <ul style="list-style-type: square;">
            <li><strong>F:</strong> Lực từ (Newton - N).</li>
            <li><strong>B:</strong> Cảm ứng từ của nam châm (Tesla - T).</li>
            <li><strong>I:</strong> Cường độ dòng điện chạy qua cuộn dây (Ampe - A).</li>
            <li><strong>&ell;:</strong> Tổng chiều dài dây dẫn trong từ trường (mét - m) [6].</li>
        </ul>

        <h3>b. Áp suất tác dụng lên màng loa (p)</h3>
        <p>Trong các bài tập nâng cao, áp suất cực đại tác dụng lên màng loa có diện tích <em>S</em> được tính bằng:</p>
        <div style="background-color: #f1f1f1; padding: 15px; border-left: 5px solid #27ae60; margin: 10px 0;">
            <strong>p = F / S</strong>
        </div>
        <p>Nếu màng loa hình tròn bán kính R, diện tích là S = &pi;R<sup>2</sup> [10].</p>

        <h3>c. Mối liên hệ tần số</h3>
        <p>Tần số của sóng âm phát ra bằng tần số của dòng điện xoay chiều chạy trong cuộn dây:</p>
        <p style="text-align: center;"><strong>f<sub>âm</sub> = f<sub>điện</sub></strong></p>
    </section>

    <section>
        <h2 style="color: #2980b9;">4. Các nhận định thường gặp (Trắc nghiệm)</h2>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; border-color: #ddd;">
            <tr style="background-color: #ecf0f1;">
                <th>Phát biểu</th>
                <th>Đúng/Sai</th>
                <th>Giải thích</th>
            </tr>
            <tr>
                <td>Sóng âm từ loa có thể truyền trong chân không.</td>
                <td style="color: red; font-weight: bold;">SAI</td>
                <td>Sóng âm là sóng cơ học, cần môi trường vật chất để lan truyền [9].</td>
            </tr>
            <tr>
                <td>Khi tăng cường độ dòng điện, âm thanh phát ra nhỏ đi.</td>
                <td style="color: red; font-weight: bold;">SAI</td>
                <td>I tăng &rarr; F tăng &rarr; Biên độ dao động mạnh hơn &rarr; Âm to hơn [4].</td>
            </tr>
            <tr>
                <td>Loa hoạt động dựa trên hiện tượng cảm ứng điện từ.</td>
                <td style="color: orange; font-weight: bold;">Cần lưu ý</td>
                <td>Chính xác là dựa trên <strong>lực từ tác dụng lên dòng điện</strong>. Cảm ứng điện từ là nguyên lý của Micro (ngược lại với Loa) [11], [1].</td>
            </tr>
            <tr>
                <td>Sóng âm do loa tạo ra trong không khí là sóng dọc.</td>
                <td style="color: green; font-weight: bold;">ĐÚNG</td>
                <td>Do quá trình nén và giãn của khối không khí [12].</td>
            </tr>
        </table>
    </section>

    <section>
        <h2 style="color: #2980b9;">5. Ví dụ minh họa</h2>
        <div style="border: 2px dashed #f39c12; padding: 15px; background-color: #fffaf0; border-radius: 5px;">
            <p><strong>Bài toán:</strong> Trong một chiếc loa điện động, cuộn dây dẫn có tổng chiều dài <strong>&ell; = 25 cm</strong> đặt trong từ trường <strong>B = 0,35 T</strong>. Màng loa có đường kính <strong>D = 15 cm</strong>. Dòng điện chạy qua cuộn dây có phương trình <strong>i = 2cos(100&pi;t) (A)</strong>. Tính lực từ cực đại và áp suất cực đại tác dụng lên màng loa.</p>
            <hr style="border: 0; border-top: 1px solid #f39c12;">
            <p><strong>Giải:</strong></p>
            <p>1. Đổi đơn vị: &ell; = 0,25 m; D = 0,15 m &rarr; R = 0,075 m; I<sub>0</sub> = 2 A.</p>
            <p>2. Lực từ cực đại (F<sub>max</sub>):<br>
               F<sub>max</sub> = B &cdot; I<sub>0</sub> &cdot; &ell; = 0,35 &cdot; 2 &cdot; 0,25 = <strong>0,175 (N)</strong> [13].
            </p>
            <p>3. Diện tích màng loa (S):<br>
               S = &pi; &cdot; R<sup>2</sup> = &pi; &cdot; (0,075)<sup>2</sup> &approx; 0,01767 (m<sup>2</sup>) [10].
            </p>
            <p>4. Áp suất cực đại (p<sub>max</sub>):<br>
               p<sub>max</sub> = F<sub>max</sub> / S = 0,175 / 0,01767 &approx; <strong>9,9 (Pa)</strong> [10].
            </p>
        </div>
    </section>
</div>

<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 20px auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); background: #fff;">
    
    <div style="background: #2c3e50; color: #fff; padding: 15px; text-align: center;">
        <h3 style="margin: 0;">Mô phỏng Cấu tạo & Nguyên lý Loa Điện động</h3>
    </div>

    <div style="display: flex; flex-wrap: wrap; padding: 20px; gap: 20px;">
        
        <div style="flex: 1; min-width: 350px; background: #f9f9f9; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; align-items: center;">
            <svg width="350" height="300" viewBox="0 0 350 300">
                <rect x="50" y="110" width="40" height="80" fill="#7f8c8d" stroke="#34495e" stroke-width="2" />
                <rect x="90" y="130" width="30" height="40" fill="#e74c3c" stroke="#c0392b" stroke-width="2" /> <text x="105" y="155" fill="white" font-weight="bold" text-anchor="middle">N</text>
                <text x="70" y="155" fill="white" font-weight="bold" text-anchor="middle">S</text>
                <text x="70" y="210" font-size="12" font-weight="bold">Nam châm</text>

                <g id="vibration-system">
                    <animateTransform attributeName="transform" type="translate" values="-5 0; 5 0; -5 0" dur="0.2s" repeatCount="indefinite" />
                    
                    <rect x="120" y="125" width="15" height="50" fill="#d35400" stroke="#a04000" stroke-width="1" />
                    <line x1="120" y1="135" x2="135" y2="135" stroke="#fff" stroke-width="1" stroke-dasharray="2,1" />
                    <line x1="120" y1="145" x2="135" y2="145" stroke="#fff" stroke-width="1" stroke-dasharray="2,1" />
                    <line x1="120" y1="155" x2="135" y2="155" stroke="#fff" stroke-width="1" stroke-dasharray="2,1" />
                    <line x1="120" y1="165" x2="135" y2="165" stroke="#fff" stroke-width="1" stroke-dasharray="2,1" />

                    <path d="M 135 150 L 250 50 L 250 250 Z" fill="rgba(52, 152, 219, 0.3)" stroke="#2980b9" stroke-width="3" />
                    <line x1="250" y1="50" x2="270" y2="30" stroke="#2980b9" stroke-width="2" />
                    <line x1="250" y1="250" x2="270" y2="270" stroke="#2980b9" stroke-width="2" />
                    
                    <g opacity="0.6">
                        <circle cx="280" cy="150" r="10" fill="none" stroke="#3498db" stroke-width="2">
                            <animate attributeName="r" from="10" to="60" dur="1s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.6" to="0" dur="1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="280" cy="150" r="10" fill="none" stroke="#3498db" stroke-width="2">
                            <animate attributeName="r" from="10" to="60" dur="1s" begin="0.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.6" to="0" dur="1s" begin="0.5s" repeatCount="indefinite" />
                        </circle>
                    </g>
                </g>

                <text x="127" y="115" font-size="11" text-anchor="middle" font-weight="bold">Cuộn dây</text>
                <text x="210" y="155" font-size="12" font-weight="bold">Màng loa</text>
                <text x="300" y="155" font-size="11" fill="#2980b9" font-weight="bold">Sóng âm</text>

                <path d="M 127 175 L 127 220 L 150 220" fill="none" stroke="#333" stroke-width="1.5" marker-end="url(#arrow)" />
                <path d="M 150 240 L 127 240 L 127 175" fill="none" stroke="#333" stroke-width="1.5" />
                <text x="160" y="235" font-size="11" font-style="italic">Tín hiệu AC</text>
            </svg>
            <p style="font-size: 13px; color: #666; margin-top: 10px;"><i>Hệ thống cuộn dây dao động trong từ trường tạo ra sóng âm.</i></p>
        </div>
    </div>
</div>
            `,
            type: 'Theory',
            status: 'ACTIVE'
        }],
        {
            name: 'Loa điện động',
            description: 'Mô hình 3D Loa điện động',
            source_url: '',
            thumbnail_url: '/loadiendong.png',
            type: 'LOUDSPEAKER', // Matches ModelRegistry
            status: 'ACTIVE'
        },
        [{
            title: 'Ví dụ Loa 1',
            problem: `
<p>
    Trong một chiếc loa điện động, một cuộn dây dẫn có chiều dài \\( l = 25 \\text{ cm} \\) được đặt trong từ trường của nam châm vĩnh cửu có cường độ từ trường \\( B = 0,35 \\text{ T} \\). Khi dòng điện xoay chiều chạy qua cuộn dây, từ trường của nam châm tác động lên cuộn dây khiến cuộn dây dao động. Cuộn dây này được gắn với màng loa có đường kính \\( D = 15 \\text{ cm} \\) (màng dao động), và khi cuộn dây dao động, nó làm cho màng loa dao động theo, tạo ra âm thanh. Giả sử loa đang hoạt động với dòng điện xoay chiều: \\( i = 2\\cos(100\\pi t) \\text{ (A)} \\).
</p>

<ul>
    <li><strong>1.</strong> Nguyên lí hoạt động của loa điện động dựa trên lực từ tác dụng lên dòng điện trong từ trường.</li>
    <li><strong>2.</strong> Âm thanh phát ra từ loa điện động là do màng loa dao động làm rung không khí.</li>
    <li><strong>3.</strong> Khi tăng cường độ dòng điện chạy qua cuộn dây thì âm phát thanh phát ra nhỏ đi. (Ảnh ghi chú: Sai, \\( I \\) tăng \\(\\rightarrow F_t\\) tăng \\(\\rightarrow\\) màng loa dđ mạnh hơn \\(\\rightarrow A\\) lớn \\(\\rightarrow\\) âm nghe to hơn).</li>
    <li><strong>4.</strong> Sóng âm thanh được loa điện tạo ra là do quá trình nén và giãn của khối không khí do màng loa tạo ra khi dao động. (Ảnh ghi chú: Sóng âm truyền trong KK là sóng dọc).</li>
    <li><strong>5.</strong> Sóng âm thanh phát ra từ loa có thể truyền trong chân không. (Ảnh đánh dấu: Sai).</li>
    <li><strong>6.</strong> Cuộn dây và màng loa dao động theo tần số của dòng điện đầu vào, từ đó tạo ra âm thanh có cùng tần số.</li>
    <li><strong>7.</strong> Trong quá trình rung động, áp suất cực đại tác dụng trên màn loa khoảng 9,9 Pa.</li>
</ul>
            `,
            solution: `
<Strong>Tóm tắt dữ kiện đề bài:</Strong>
    <ul>
        <li>Chiều dài dây dẫn: \\( l = 25 \\text{ cm} = 0,25 \\text{ m} \\).</li>
        <li>Cảm ứng từ: \\( B = 0,35 \\text{ T} \\).</li>
        <li>Đường kính màng loa: \\( D = 15 \\text{ cm} = 0,15 \\text{ m} \\).</li>
        <li>Phương trình dòng điện: \\( i = 2\\cos(100\\pi t) \\text{ (A)} \\).</li>
        <li>Suy ra cường độ dòng điện cực đại: \\( I_0 = 2 \\text{ A} \\).</li>
    </ul>

    <hr>

    <Strong>Phân tích từng phát biểu:</Strong>

    <p><strong>1. Nguyên lí hoạt động của loa điện động dựa trên lực từ tác dụng lên dòng điện trong từ trường.</strong></p>
    <p><strong>Kết luận: ĐÚNG</strong></p>
    <p><em>Giải thích:</em> Khi có dòng điện chạy qua cuộn dây đặt trong từ trường của nam châm vĩnh cửu, lực từ (lực Ampe) sẽ tác dụng lên cuộn dây làm nó chuyển động.</p>

    <hr>

    <p><strong>2. Âm thanh phát ra từ loa điện động là do màng loa dao động làm rung không khí.</strong></p>
    <p><strong>Kết luận: ĐÚNG</strong></p>
    <p><em>Giải thích:</em> Cuộn dây gắn liền với màng loa. Khi cuộn dây dao động dưới tác dụng của lực từ, màng loa dao động theo, nén và giãn lớp không khí tiếp xúc, tạo ra sóng âm.</p>

    <hr>

    <p><strong>3. Khi tăng cường độ dòng điện chạy qua cuộn dây thì âm phát thanh phát ra nhỏ đi.</strong></p>
    <p><strong>Kết luận: SAI</strong></p>
    <p><em>Giải thích:</em> Theo công thức lực từ \\( F = B \\cdot I \\cdot l \\). Khi cường độ dòng điện \\( I \\) tăng thì lực từ \\( F \\) tăng, làm màng loa dao động mạnh hơn (Biên độ \\( A \\) tăng), dẫn đến âm thanh phát ra phải <strong>to hơn</strong>.</p>

    <hr>

    <p><strong>4. Sóng âm thanh được loa điện tạo ra là do quá trình nén và giãn của khối không khí do màng loa tạo ra khi dao động.</strong></p>
    <p><strong>Kết luận: ĐÚNG</strong></p>
    <p><em>Giải thích:</em> Sóng âm truyền trong không khí là sóng dọc, được hình thành bởi các lớp không khí bị nén và giãn liên tục lan truyền đi.</p>

    <hr>

    <p><strong>5. Sóng âm thanh phát ra từ loa có thể truyền trong chân không.</strong></p>
    <p><strong>Kết luận: SAI</strong></p>
    <p><em>Giải thích:</em> Sóng âm là sóng cơ học, cần môi trường vật chất (Rắn, Lỏng, Khí) để lan truyền. Chân không không có vật chất nên sóng âm không truyền được.</p>

    <hr>

    <p><strong>6. Cuộn dây và màng loa dao động theo tần số của dòng điện đầu vào, từ đó tạo ra âm thanh có cùng tần số.</strong></p>
    <p><strong>Kết luận: ĐÚNG</strong></p>
    <p><em>Giải thích:</em> Loa là thiết bị biến đổi dao động điện thành dao động cơ có cùng tần số. Tần số dòng điện quyết định tần số rung của màng loa và cao độ của âm thanh.</p>

    <hr>

    <p><strong>7. Trong quá trình rung động, áp suất cực đại tác dụng trên màn loa khoảng 9,9 Pa.</strong></p>
    <p><strong>Kết luận: ĐÚNG</strong></p>
    <p><em>Giải thích chi tiết và tính toán:</em></p>
    
    <p><strong>Bước 1: Tính lực từ cực đại (\\( F_{max} \\))</strong></p>
    <p>Lực từ cực đại tác dụng lên cuộn dây đạt được khi cường độ dòng điện đạt cực đại (\\( I_0 = 2 \\text{ A} \\)):</p>
    $$ F_{max} = B \\cdot I_0 \\cdot l = 0,35 \\cdot 2 \\cdot 0,25 = 0,175 \\text{ (N)} $$
    
    <p><strong>Bước 2: Tính diện tích màng loa (\\( S \\))</strong></p>
    <p>Màng loa hình tròn có đường kính \\( D = 0,15 \\text{ m} \\), bán kính \\( R = \\frac{D}{2} = 0,075 \\text{ m} \\).</p>
    $$ S = \\pi \\cdot R^2 = \\pi \\cdot (0,075)^2 \\approx 0,01767 \\text{ (m}^2\\text{)} $$
    
    <p><strong>Bước 3: Tính áp suất cực đại (\\( p_{max} \\))</strong></p>
    <p>Áp suất bằng lực chia cho diện tích bị ép:</p>
    $$ p_{max} = \\frac{F_{max}}{S} = \\frac{0,175}{0,01767} \\approx 9,903 \\text{ (Pa)} $$
    
    <p><strong>Kết luận:</strong> Giá trị xấp xỉ \\( 9,9 \\text{ Pa} \\). Mệnh đề đúng.</p>
            `,
            type: 'Calculation',
            status: 'ACTIVE'
        }],
        [
            // PROBLEM 1
            {
                question: `
<div>
    <p>
        Loa là một thiết bị có nhiệm vụ phát ra âm thanh bằng cách chuyển tín hiệu điện thành tín hiệu âm thanh (sóng âm). Loa có thể được cấu tạo gồm các bộ phận đơn giản như (Hình a). Khi tín hiệu điện biến thiên theo tần số của tín hiệu âm thanh, cuộn dây và màng loa dao động cùng tần số, dẫn đến sự dao động của không khí và sóng âm được tạo ra.
    </p>
    <p>
        Cấu tạo đơn giản của bộ phận tạo ra sự dao động của không khí của loa gồm hai phần: nam châm hình tròn được đặt cố định, trọng tâm nam châm đặt thẳng hàng với trọng tâm màng loa và cuộn dây hình tròn (Hình b). Khi dòng điện thay đổi theo thời gian chạy qua cuộn dây đặt trong từ trường của nam châm sẽ làm xuất hiện lực từ tác dụng lên cuộn dây, lực từ này có chiều thay đổi làm nón loa dao động theo, từ đó tạo ra âm thanh phát ra tương ứng với tín hiệu âm thanh đầu vào.
    </p>
    <ul>
        <li>
            <strong>a.</strong> Loa điện hoạt động dựa trên hiện tượng cảm ứng điện từ.
        </li>
        <li>
            <strong>b.</strong> Loa có nhiệm vụ biến dao động điện thành dao động âm cùng tần số.
        </li>
        <li>
            <strong>c.</strong> Sóng âm do loa tạo ra truyền trong không khí tới tai người nghe thuộc loại sóng dọc.
        </li>
        <li>
            <strong>d.</strong> Biết từ trường của nam châm có độ lớn cảm ứng từ là 0,075T. Cuộn dây có đường kính khoảng 7,2cm, gồm 20 vòng dây và có điện trở là 5,8Ω. Khi kết nối với nguồn có hiệu điện thế 12V, dòng điện chạy trong cuộn dây tại một thời điểm xác định có chiều cùng chiều kim đồng hồ như (Hình b). Tại thời điểm này, lực từ tác dụng trên cuộn dây có độ lớn là 0,7N.
        </li>
    </ul>
</div>
                `,
                options: [],
                correct_answer: "",
                level: 'MEDIUM',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đáp án đang được cập nhật'
            },
            // PROBLEM 2
            {
                question: `
<div>
    <Strong> Quan sát mô hình loa điện động được mô tả như hình dưới. Xét tính đúng/sai các phát biểu sau</Strong>
    <ul>
        <li>
            <strong>a.</strong> Khi cho dòng điện không đổi vào hai điểm nối tín hiệu thì loa chỉ phát ra âm với một tần số không đổi.
        </li>
        <li>
            <strong>b.</strong> Sóng âm thanh phát ra từ loa có thể truyền trong chân không.
        </li>
        <li>
            <strong>c.</strong> Khi có dòng điện xoay chiều chạy qua cuộn dây thì nam châm vĩnh cửu sẽ dao động làm cho màng loa dao động với tần số âm.
        </li>
        <li>
            <strong>d.</strong> Nếu nối hai điểm nối tín hiệu vào loa với điện áp biểu diễn như hình thì tần số âm loa phát ra là \\(\\frac{4000}{3} Hz\\).
        </li>
    </ul>
</div>
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">
    <h4 style="text-align: center; margin-bottom: 10px;">Đồ thị Điện áp theo Thời gian (u - t)</h4>
    
    <svg width="100%" height="300" viewBox="0 0 500 300" style="overflow: visible;">
        <line x1="50" y1="280" x2="50" y2="20" stroke="black" stroke-width="2" marker-end="url(#arrow)" />
        <text x="60" y="30" font-weight="bold">u (V)</text>
        
        <line x1="50" y1="150" x2="480" y2="150" stroke="black" stroke-width="2" marker-end="url(#arrow)" />
        <text x="460" y="175" font-weight="bold">t (10⁻⁵ s)</text>

        <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="black" />
            </marker>
        </defs>

        <line x1="50" y1="50" x2="450" y2="50" stroke="#ccc" stroke-dasharray="5,5" /> <line x1="50" y1="75" x2="450" y2="75" stroke="#eee" stroke-dasharray="5,5" /> <line x1="50" y1="100" x2="450" y2="100" stroke="#eee" stroke-dasharray="5,5" /> <line x1="50" y1="125" x2="450" y2="125" stroke="#eee" stroke-dasharray="5,5" /> <line x1="50" y1="175" x2="450" y2="175" stroke="#eee" stroke-dasharray="5,5" /> <line x1="50" y1="200" x2="450" y2="200" stroke="#eee" stroke-dasharray="5,5" /> <line x1="50" y1="225" x2="450" y2="225" stroke="#eee" stroke-dasharray="5,5" /> <line x1="50" y1="250" x2="450" y2="250" stroke="#ccc" stroke-dasharray="5,5" /> <line x1="116.6" y1="50" x2="116.6" y2="250" stroke="#ccc" stroke-dasharray="5,5" /> <line x1="183.3" y1="50" x2="183.3" y2="250" stroke="#ccc" stroke-dasharray="5,5" /> <line x1="250" y1="50" x2="250" y2="250" stroke="#ccc" stroke-dasharray="5,5" /> <line x1="316.6" y1="50" x2="316.6" y2="250" stroke="#ccc" stroke-dasharray="5,5" /> <line x1="383.3" y1="50" x2="383.3" y2="250" stroke="#ccc" stroke-dasharray="5,5" /> <line x1="450" y1="50" x2="450" y2="250" stroke="#ccc" stroke-dasharray="5,5" /> <text x="35" y="55" font-size="12">4</text>
        <text x="35" y="80" font-size="12">3</text>
        <text x="35" y="105" font-size="12">2</text>
        <text x="35" y="130" font-size="12">1</text>
        <text x="35" y="155" font-size="12">0</text>
        <text x="30" y="180" font-size="12">-1</text>
        <text x="30" y="205" font-size="12">-2</text>
        <text x="30" y="230" font-size="12">-3</text>
        <text x="30" y="255" font-size="12">-4</text>

        <text x="110" y="165" font-size="12">5</text>
        <text x="175" y="165" font-size="12">10</text>
        <text x="242" y="165" font-size="12">15</text>
        <text x="308" y="165" font-size="12">20</text>
        <text x="375" y="165" font-size="12">25</text>
        <text x="442" y="165" font-size="12">30</text>

        <path d="M 50,50 
                 C 83.3,50 83.3,250 116.6,250
                 C 150,250 150,50 183.3,50
                 C 216.6,50 216.6,250 250,250
                 C 283.3,250 283.3,50 316.6,50
                 C 350,50 350,250 383.3,250
                 C 416.6,250 416.6,50 450,50" 
              fill="none" stroke="black" stroke-width="3" />
    </svg>
    
    <div style="margin-top: 15px; font-size: 14px; background: #f1f8ff; padding: 10px; border-radius: 4px; border-left: 4px solid #007bff;">
        <strong>Thông số từ đồ thị:</strong>
        <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Biên độ điện áp: $U_0 = 4 \\text{ V}$</li>
            <li>Chu kỳ: $T = 7,5 \\times 10^{-5} \\text{ s}$ (từ $0$ đến $7,5$)</li>
            <li>Tần số: $f = \\frac{1}{T} = \\frac{40000}{3} \\text{ Hz}$</li>
        </ul>
    </div>
</div>
                `,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đáp án đang được cập nhật'
            }
        ]
    );

    // 3. MASS SPECTROMETER (Máy quang phổ khối)
    await createModelContent(
        'Vật lý hạt nhân',
        'Máy quang phổ khối',
        [{
            title: 'Lý thuyết mô hình Máy quang phổ khối',
            content_html: `
<div class="spectrometer-theory" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto;">
    <h1 style="text-align: center; color: #8e44ad; border-bottom: 2px solid #8e44ad; padding-bottom: 10px;">CHUYÊN ĐỀ: MÁY QUANG PHỔ KHỐI (MASS SPECTROMETER)</h1>

    <section>
        <h2 style="color: #2980b9;">1. Định nghĩa và Chức năng</h2>
        <p><strong>Định nghĩa:</strong> Máy quang phổ khối (khối phổ kế) là một thiết bị dùng để tách các ion (hạt mang điện) có khối lượng khác nhau dựa trên sự lệch hướng của chúng trong từ trường [1].</p>
        <p><strong>Chức năng chính:</strong></p>
        <ul>
            <li>Đo khối lượng của các hạt cơ bản (electron, proton...) hoặc các ion nguyên tử/phân tử [2].</li>
            <li>Xác định thành phần đồng vị của một nguyên tố hóa học [2], [3].</li>
            <li>Phân tích cấu trúc phân tử trong hóa học và sinh học [3].</li>
        </ul>
    </section>

    <section>
        <h2 style="color: #2980b9;">2. Cấu tạo và Nguyên lý hoạt động</h2>
        <p>Quá trình hoạt động gồm 3 giai đoạn chính:</p>
        
        <h3>Giai đoạn 1: Tạo ion và Tăng tốc (Buồng gia tốc)</h3>
        <ul>
            <li>Các nguyên tử của mẫu chất được làm nóng bay hơi và bị bắn phá bởi chùm electron để trở thành các ion dương (thường là ion +1) [1].</li>
            <li>Các ion này được tăng tốc bởi một điện trường mạnh (hiệu điện thế U) giữa hai khe hẹp S<sub>1</sub> và S<sub>2</sub>.</li>
            <li>Vận tốc khi ra khỏi buồng gia tốc:</li>
        </ul>
        <div style="background-color: #f1f1f1; padding: 10px; border-left: 5px solid #8e44ad; margin-bottom: 15px;">
            <strong>&frac12;mv<sup>2</sup> = |q|U &rArr; v = &radic;(2|q|U / m)</strong>
        </div>

        <h3>Giai đoạn 2: Chọn vận tốc (Bộ lọc vận tốc - Tùy chọn)</h3>
        <ul>
            <li>Để chùm hạt có vận tốc giống nhau, người ta cho chúng đi qua vùng không gian có cả điện trường E và từ trường B<sub>0</sub> vuông góc nhau.</li>
            <li>Chỉ những hạt có vận tốc thỏa mãn <strong>v = E / B<sub>0</sub></strong> mới đi thẳng qua khe vào buồng phân tách [4].</li>
        </ul>

        <h3>Giai đoạn 3: Phân tách theo khối lượng (Buồng từ trường)</h3>
        <ul>
            <li>Chùm ion đi vào vùng từ trường đều B (vuông góc với vận tốc).</li>
            <li>Lực Lo-ren-xơ đóng vai trò lực hướng tâm làm ion chuyển động theo quỹ đạo tròn [1], [5].</li>
            <li>Bán kính quỹ đạo:</li>
        </ul>
        <div style="background-color: #f1f1f1; padding: 10px; border-left: 5px solid #8e44ad;">
            <strong>R = (mv) / (|q|B)</strong>
        </div>
        <p>Thay v từ giai đoạn 1 vào, ta có mối liên hệ giữa R và m:</p>
        <div style="background-color: #f1f1f1; padding: 10px; border-left: 5px solid #8e44ad;">
            <strong>R = (1/B) * &radic;(2mU / |q|)</strong>
        </div>
        <p>&rArr; <strong>R &sim; &radic;m</strong>. Các hạt có khối lượng m khác nhau sẽ chùm lên phim ảnh (hoặc detector) ở các vị trí khác nhau (bán kính R khác nhau) [5], [6].</p>
    </section>

    <section>
        <h2 style="color: #2980b9;">3. Ứng dụng: Tách đồng vị</h2>
        <p>Ví dụ: Tách đồng vị Neon (<sup>20</sup>Ne và <sup>22</sup>Ne).</p>
        <ul>
            <li>Hai đồng vị có cùng điện tích q, cùng được tăng tốc bởi U &rArr; cùng năng lượng.</li>
            <li>Do khối lượng khác nhau (m<sub>22</sub> > m<sub>20</sub>) nên bán kính quỹ đạo khác nhau (R<sub>22</sub> > R<sub>20</sub>).</li>
            <li>Chúng sẽ đập vào tấm phim tại hai vạch riêng biệt. Khoảng cách giữa hai vạch giúp tính toán chính xác khối lượng hoặc xác định tỉ lệ phần trăm đồng vị [7].</li>
        </ul>
    </section>
</div>
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 20px auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); background: #fff;">
        <div style="background: #2c3e50; color: #fff; padding: 15px; text-align: center;">
            <h3 style="margin: 0;">Mô phỏng Nguyên lý Máy Quang phổ khối</h3>
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; padding: 20px;">
            <svg width="600" height="350" viewBox="0 0 600 350">
                <!-- Vùng Gia tốc (Accelerator) -->
                <rect x="10" y="100" width="100" height="150" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="2" />
                <text x="60" y="80" text-anchor="middle" font-weight="bold" fill="#7f8c8d">Buồng Gia tốc (U)</text>
                
                <rect x="20" y="120" width="10" height="110" fill="#95a5a6" /> <text x="25" y="250" text-anchor="middle" font-weight="bold">+</text>
                <rect x="90" y="120" width="10" height="110" fill="#95a5a6" /> <text x="95" y="250" text-anchor="middle" font-weight="bold">-</text>
                <line x1="30" y1="175" x2="90" y2="175" stroke="#e74c3c" stroke-width="2" marker-end="url(#arrow)" />

                <!-- Vùng Từ trường (Magnetic Field) -->
                <rect x="150" y="50" width="400" height="250" fill="#eafaf1" stroke="#4cd137" stroke-width="2" />
                <text x="350" y="40" text-anchor="middle" font-weight="bold" fill="#27ae60">Buồng Từ trường (B)</text>
                
                <!-- Ký hiệu từ trường B -->
                <g fill="#27ae60" opacity="0.3">
                    <circle cx="200" cy="100" r="3" /> <circle cx="200" cy="100" r="8" stroke="#27ae60" fill="none" />
                    <circle cx="300" cy="100" r="3" /> <circle cx="300" cy="100" r="8" stroke="#27ae60" fill="none" />
                    <circle cx="400" cy="100" r="3" /> <circle cx="400" cy="100" r="8" stroke="#27ae60" fill="none" />
                    <circle cx="200" cy="200" r="3" /> <circle cx="200" cy="200" r="8" stroke="#27ae60" fill="none" />
                    <circle cx="300" cy="200" r="3" /> <circle cx="300" cy="200" r="8" stroke="#27ae60" fill="none" />
                    <circle cx="400" cy="200" r="3" /> <circle cx="400" cy="200" r="8" stroke="#27ae60" fill="none" />
                </g>

                <!-- Quỹ đạo hạt (Trajectories) -->
                <path d="M 100 175 L 150 175" stroke="#e74c3c" stroke-width="3" stroke-dasharray="5,5" />
                
                <!-- Hạt nhẹ (R nhỏ) -->
                <path d="M 150 175 A 70 70 0 0 1 290 175" fill="none" stroke="#e74c3c" stroke-width="3" />
                <circle cx="290" cy="175" r="5" fill="#e74c3c" />
                <text x="290" y="195" text-anchor="middle" font-weight="bold" fill="#e74c3c">m₁ (nhẹ)</text>

                <!-- Hạt nặng (R lớn) -->
                <path d="M 150 175 A 120 120 0 0 1 390 175" fill="none" stroke="#2980b9" stroke-width="3" />
                <circle cx="390" cy="175" r="6" fill="#2980b9" />
                <text x="390" y="195" text-anchor="middle" font-weight="bold" fill="#2980b9">m₂ (nặng)</text>

                <!-- Detector -->
                <rect x="250" y="165" width="200" height="20" fill="#34495e" />
                <text x="480" y="180" fill="#34495e" font-style="italic">Detector / Phim ảnh</text>

                <!-- Công thức Note -->
                <rect x="350" y="260" width="180" height="60" fill="#fdfefe" stroke="#f39c12" rx="5" />
                <text x="360" y="280" font-family="monospace" font-size="14" fill="#d35400">R = (1/B)√(2mU/q)</text>
                <text x="360" y="300" font-size="12" fill="#7f8c8d">R tỉ lệ thuận với √m</text>
            </svg>
        </div>
    </div>
            `,
            type: 'Theory',
            status: 'ACTIVE'
        }],
        {
            name: 'Máy quang phổ khối',
            description: 'Mô hình 3D Máy quang phổ khối',
            source_url: '',
            thumbnail_url: '/mayQuangphokhoi.png',
            type: 'MASS_SPECTROMETER',
            status: 'ACTIVE'
        },
        [{
            title: 'Bài toán Máy quang phổ khối (Ví dụ)',
            problem: `
<p>
    Một máy quang phổ khối (khối phổ kế) được dùng để tách hai đồng vị của nguyên tố Kali là \\( ^{39}K \\) và \\( ^{41}K \\). Các nguyên tử Kali bị ion hóa một lần (mang điện tích \\( q = +e \\)), sau đó được tăng tốc bởi hiệu điện thế \\( U = 2000 \\text{ V} \\) rồi đi vào từ trường đều \\( B = 0,8 \\text{ T} \\) theo phương vuông góc với đường sức từ.
    <br><br>
    Biết:
    <ul>
        <li>Điện tích nguyên tố: \\( e = 1,6 \\cdot 10^{-19} \\text{ C} \\).</li>
        <li>Khối lượng của 1 đơn vị khối lượng nguyên tử (u): \\( 1u = 1,6605 \\cdot 10^{-27} \\text{ kg} \\).</li>
        <li>Coi khối lượng của ion bằng số khối của nó nhân với \\( u \\) (tức là \\( m_{39} = 39u \\), \\( m_{41} = 41u \\)).</li>
    </ul>
    <strong>Tính khoảng cách giữa hai vạch mà các đồng vị in lên tấm phim đặt ở cửa ra của máy.</strong>
</p>
            `,
            solution: `
<h3>Lời Giải Chi Tiết</h3>

    <h4>Bước 1: Thiết lập công thức tính bán kính quỹ đạo (R)</h4>
    <p>Khi ion bay vào từ trường, lực Lo-ren-xơ đóng vai trò lực hướng tâm:</p>
    $$ |q|vB = \\frac{mv^2}{R} \\Rightarrow R = \\frac{mv}{|q|B} $$ (1)
    
    <p>Vận tốc \\( v \\) thu được sau khi được tăng tốc bởi hiệu điện thế \\( U \\) (định lý biến thiên động năng):</p>
    $$ \\frac{1}{2}mv^2 = |q|U \\Rightarrow v = \\sqrt{\\frac{2|q|U}{m}} $$ (2)
    
    <p>Thay (2) vào (1), ta được công thức tính bán kính theo \\( m, U, B \\):</p>
    $$ R = \\frac{m}{|q|B} \\cdot \\sqrt{\\frac{2|q|U}{m}} = \\frac{1}{B} \\sqrt{\\frac{2mU}{|q|}} $$

    <h4>Bước 2: Tính bán kính quỹ đạo cho từng đồng vị</h4>
    <p>Ta thay số vào công thức: \\( B = 0,8 \\text{ T}; U = 2000 \\text{ V}; |q| = 1,6 \\cdot 10^{-19} \\text{ C} \\)</p>
    
    <p>Biểu thức tổng quát:</p>
    $$ R = \\frac{1}{0,8} \\sqrt{\\frac{2 \\cdot m \\cdot 2000}{1,6 \\cdot 10^{-19}}} = 1,25 \\cdot \\sqrt{\\frac{4000 \\cdot m}{1,6 \\cdot 10^{-19}}} $$
    $$ R = 1,25 \\cdot \\sqrt{2,5 \\cdot 10^{22} \\cdot m} $$

    <p><strong>Với đồng vị K-39:</strong> \\( m_{39} = 39u = 39 \\times 1,6605 \\cdot 10^{-27} \\text{ kg} \\)</p>
    $$ R_{39} = 1,25 \\cdot \\sqrt{2,5 \\cdot 10^{22} \\cdot (39 \\cdot 1,6605 \\cdot 10^{-27})} $$
    $$ R_{39} \\approx 1,25 \\cdot \\sqrt{2,5 \\cdot 39 \\cdot 1,6605 \\cdot 10^{-5}} $$
    $$ R_{39} \\approx 1,25 \\cdot \\sqrt{161,898 \\cdot 10^{-5}} \\approx 1,25 \\cdot 0,04023 \\approx 0,05029 \\text{ (m)} = 50,29 \\text{ mm} $$

    <p><strong>Với đồng vị K-41:</strong> \\( m_{41} = 41u = 41 \\times 1,6605 \\cdot 10^{-27} \\text{ kg} \\)</p>
    $$ R_{41} = R_{39} \\cdot \\sqrt{\\frac{41}{39}} \\approx 50,29 \\cdot 1,0253 \\approx 51,56 \\text{ mm} $$

    <h4>Bước 3: Tính khoảng cách giữa hai vạch (d)</h4>
    <p>Các ion chuyển động nửa vòng tròn rồi đập vào phim, nên vị trí chạm phim cách khe vào một đoạn là đường kính \\( 2R \\).</p>
    <p>Khoảng cách giữa hai vạch trên phim là hiệu hai đường kính:</p>
    $$ d = 2R_{41} - 2R_{39} = 2(R_{41} - R_{39}) $$
    $$ d = 2(51,56 - 50,29) = 2 \\cdot 1,27 = 2,54 \\text{ (mm)} $$

    <div class="result-box" style="border: 2px solid #27ae60; padding: 10px; border-radius: 5px; margin-top: 15px; background-color: #eafaf1; text-align: center;">
        <strong>Kết quả: Khoảng cách giữa hai vạch là 2,54 mm.</strong>
    </div>

            `,
            type: 'Calculation',
            status: 'ACTIVE'
        }],
        [
            // PROBLEM 1
            {
                question: `
<div>
    <p>Các ion dương thoát ra khỏi nguồn ion qua khe\\( S_1 \\) có cùng vận tốc đầu\\( \\vec{v_0} \\) theo phương\\( x \\) được dẫn vào chính giữa hai bản tụ điện phẳng có chiều dài\\( l=5 \\text{cm} \\). Hai bản tụ điện cách nhau\\( d=2 \\text{cms} \\) và có hiệu điện thế\\( U=100 \\text{V} \\). Sau khi ra khỏi tụ điện, các ion đi vào trong một vùng từ trường có\\( \\vec{B} \\) vuông góc với mặt phẳng hình vẽ. Trong vùng từ trường có đặt hai tấm phim đặc biệt\\( P_1, P_2 \\) vuông góc với chùm ion đi ra khỏi tụ điện (Hình).
        <br>
        Biết:\\( v_0= 105 \\text{m/s} \\);\\( B=0,5 \\text{mT} \\).\\( O_2 \\) cách bản tụ dưới\\( h=1,5 \\text{cm} \\).
        <br>
        Để thu được các vết ion ứng với khối lượng\\( m_1=10^{-23} \\text{kg} \\) và\\( m_2=1,5.10^{-23} \\text{kg} \\) thì phải đặt hai tấm phim\\( P_1, P_2 \\) cách\\( O_2 \\) một khoảng bao nhiêu?
    </p>
    <ul>
        <li>
            <strong>a.</strong> Ion chuyển động trong điện trường là chuyển động ném ngang.
        </li>
        <li>
            <strong>b.</strong> Sau khi ra khỏi tụ, véctơ vận tốc hợp với phương ngang một góc 60 độ.
        </li>
        <li>
            <strong>c.</strong> Bán kính quỹ đạo của ion có khối lượng\\( m_1=10^{-23} \\text{kg} \\) là\\( R_1 \\approx 28,3 \\text{cm} \\)
        </li>
        <li>
            <strong>d.</strong> Khoảng cách đặt tấm phim\\( P_2 \\) là 6,4 cm.
        </li>
    </ul>
</div>
                `,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đáp án đang được cập nhật'
            },
            // PROBLEM 2
            {
                question: `
<div>
    <p>Máy quang phổ khối là một thiết bị dùng để tách các ion có khối lượng khác nhau. Đầu tiên, một ion có điện tích q và khối lượng m chuyển động vào vùng có điện trường và từ trường. Điện trường được tạo ra bởi hai bản kim loại song song cách nhau một khoảng d, hiệu điện thế giữa hai bản là U. Từ trường có độ lớn cảm ứng từ B vuông góc với điện trường. Sau đó ion đi vào vùng chỉ có từ trường đều B’ vuông góc với vận tốc, chuyển động theo quỹ đạo tròn rồi đập vào tấm phim. Biết rằng vận tốc của ion là\\( v = 1,6 \\cdot 10^5 \\text{ m/s} \\), từ trường\\( B = 0,4 \\text{ T} \\), khoảng cách giữa hai bản tụ\\( d = 5 \\text{ mm} \\), và bán kính quỹ đạo trong vùng B’ là\\( r = 20 \\text{ cm} \\).</p>
    <ul>
        <li>
            <strong>a.</strong> Để ion đi thẳng qua vùng điện từ trường kết hợp, lực điện phải cân bằng với lực từ.
        </li>
        <li>
            <strong>b.</strong> Hiệu điện thế giữa hai bản tụ là 320V.
        </li>
        <li>
            <strong>c.</strong> Khối lượng của ion là\\( 6,4 \\cdot 10^{-27} \\text{ kg} \\) biết điện tích ion là\\( 1,6 \\cdot 10^{-19} C \\).
        </li>
        <li>
            <strong>d.</strong> Tấm phim ghi lại vết của ion nằm cách khe vào một khoảng 40 cm.
        </li>
    </ul>
</div>
                `,
                options: [],
                correct_answer: "",
                level: 'MEDIUM',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đáp án đang được cập nhật'
            },
            // PROBLEM 3
            {
                question: `
<div>
    <p>Cho khối phổ kế được mô tả như hình vẽ. Các ion cùng điện tích q, khối lượng m và cùng độ lớn vận tốc\\( v_0 \\) bay vào trong buồng gia tốc qua khe hẹp\\( A_0 \\), tại đây các ion được gia tốc bởi điện áp U. Các ion tiếp tục bay vào buồng hãm vận tốc qua khe hẹp\\( A_1 \\). Tại buồng này với tác dụng của từ trường đều\\( \\vec{B} \\) vuông góc với vận tốc hạt và điện trường đều\\( \\vec{E} \\) có hướng như hình vẽ thì chỉ có các hạt chuyển động thẳng đều mới bay vào buồng phân tách qua khe hẹp\\( A_2 \\) theo phương vuông góc với thành của buồng và vuông góc với từ trường đều\\( \\vec{B'} \\). Bỏ qua tác dụng của trọng lực.
    </p>
    <ul>
        <li>
            <strong>a.</strong> Công của lực điện trường ở buồng gia tốc làm tăng động năng của các ion.
        </li>
        <li>
            <strong>b.</strong> Vận tốc v của hạt ngay trước khi bay vào buồng hãm vận tốc được tính bởi công thức\\( v = \\sqrt{v_0^2 + \\frac{2qU}{m}} \\).
        </li>
        <li>
            <strong>c.</strong> Để các ion chuyển động thẳng đều trong buồng hãm vận tốc thì độ lớn cảm ứng từ B phải thỏa mãn\\( B = \\frac{E}{\\sqrt{v_0^2 + \\frac{2qU}{m}}} \\).
        </li>
        <li>
            <strong>d.</strong> Trong buồng phân tách, bán kính quỹ đạo của ion được tính bởi\\( R = \\frac{1}{B'} \\sqrt{\\frac{mE}{qB}} \\).
        </li>
    </ul>
</div>
                `,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đáp án đang được cập nhật'
            }
        ]
    );

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
