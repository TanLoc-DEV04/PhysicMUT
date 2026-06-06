const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // --- 0. CLEANUP ---
    console.log('Cleaning up database...');
    await prisma.exercise.deleteMany({});
    await prisma.example.deleteMany({});
    await prisma.theory.deleteMany({});
    await prisma.model3D.deleteMany({});

    // UPSERT ROLES & USERS
    const adminPermissions = {
        "Dashboard": ["view_dashboard"],
        "Admin Management": ["view_admin_list", "view_admin_details", "add_new_admin", "edit_admin", "delete_admin"],
        "Role Management": ["view_role_list", "add_role", "edit_role", "delete_role"],
        "Theory Management": ["view_theory_list", "add_theory", "edit_theory", "delete_theory"],
        "Example Management": ["view_example_list", "add_example", "edit_example", "delete_example"],
        "Exercise Management": ["view_exercise_list", "add_exercise", "edit_exercise", "delete_exercise"],
        "3D Model Management": ["view_model_list", "add_model", "edit_model", "delete_model"],
        "User Management": ["view_user_list", "edit_user", "delete_user"]
    };

    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: { description: 'System Administrator - full access', permissions: adminPermissions, is_active: true },
        create: { name: 'ADMIN', description: 'System Administrator - full access', permissions: adminPermissions, is_active: true }
    });
    const userRole = await prisma.role.upsert({
        where: { name: 'USER' },
        update: { description: 'Regular user - read only, no admin access', permissions: {}, is_active: true },
        create: { name: 'USER', description: 'Regular user - read only, no admin access', permissions: {}, is_active: true }
    });
    const teacherLeadPermissions = {
        "Dashboard": ["view_dashboard"],
        "Theory Management": ["view_theory_list", "add_theory", "edit_theory", "delete_theory"],
        "Example Management": ["view_example_list", "add_example", "edit_example", "delete_example"],
        "Exercise Management": ["view_exercise_list", "add_exercise", "edit_exercise", "delete_exercise"],
    };
    const teacherLeadRole = await prisma.role.upsert({
        where: { name: 'TEACHER LEAD' },
        update: { description: 'Lead Teacher - manages theory, examples and exercises', permissions: teacherLeadPermissions, is_active: true },
        create: { name: 'TEACHER LEAD', description: 'Lead Teacher - manages theory, examples and exercises', permissions: teacherLeadPermissions, is_active: true }
    });
    const teacherTheoryPermissions = {
        "Dashboard": ["view_dashboard"],
        "Theory Management": ["view_theory_list", "add_theory", "edit_theory", "delete_theory"]
    };
    const teacherTheoryRole = await prisma.role.upsert({
        where: { name: 'TEACHER THEORY' },
        update: { description: 'Theory Teacher - manages theory content only', permissions: teacherTheoryPermissions, is_active: true },
        create: { name: 'TEACHER THEORY', description: 'Theory Teacher - manages theory content only', permissions: teacherTheoryPermissions, is_active: true }
    });
    const teacherExamplePermissions = {
        "Dashboard": ["view_dashboard"],
        "Example Management": ["view_example_list", "add_example", "edit_example", "delete_example"]
    };
    const teacherExampleRole = await prisma.role.upsert({
        where: { name: 'TEACHER EXAMPLE' },
        update: { description: 'Example Teacher - manages example content only', permissions: teacherExamplePermissions, is_active: true },
        create: { name: 'TEACHER EXAMPLE', description: 'Example Teacher - manages example content only', permissions: teacherExamplePermissions, is_active: true }
    });
    const teacherExercisePermissions = {
        "Dashboard": ["view_dashboard"],
        "Exercise Management": ["view_exercise_list", "add_exercise", "edit_exercise", "delete_exercise"]
    };
    const teacherExerciseRole = await prisma.role.upsert({
        where: { name: 'TEACHER EXERCISE' },
        update: { description: 'Exercise Teacher - manages exercise content only', permissions: teacherExercisePermissions, is_active: true },
        create: { name: 'TEACHER EXERCISE', description: 'Exercise Teacher - manages exercise content only', permissions: teacherExercisePermissions, is_active: true }
    });
    const designer3DPermissions = {
        "Dashboard": ["view_dashboard"],
        "3D Model Management": ["view_model_list", "add_model", "edit_model", "delete_model"]
    };
    const designer3DRole = await prisma.role.upsert({
        where: { name: '3D DESIGNER' },
        update: { description: '3D Designer - manages 3D model content only', permissions: designer3DPermissions, is_active: true },
        create: { name: '3D DESIGNER', description: '3D Designer - manages 3D model content only', permissions: designer3DPermissions, is_active: true }
    });

    // Mark old TEACHER and STUDENT roles as inactive (do NOT delete to avoid FK constraint errors)
    try {
        await prisma.role.upsert({
            where: { name: 'TEACHER' },
            update: { is_active: false, description: '[DEPRECATED] Use TEACHER LEAD / THEORY / EXAMPLE / EXERCISE instead' },
            create: { name: 'TEACHER', description: '[DEPRECATED]', is_active: false, permissions: {} }
        });
        await prisma.role.upsert({
            where: { name: 'STUDENT' },
            update: { is_active: false, description: '[DEPRECATED] Use USER instead' },
            create: { name: 'STUDENT', description: '[DEPRECATED]', is_active: false, permissions: {} }
        });
    } catch (e) { console.warn('Could not mark legacy roles inactive:', e.message); }

    const adminPwd = '123456';
    await prisma.user.upsert({
        where: { email: 'admin@physicmut.com' },
        update: {},
        create: { username: 'admin', email: 'admin@physicmut.com', password_hash: adminPwd, full_name: 'Quản trị viên', department: 'Administration', role: { connect: { id: adminRole.id } } }
    });
    await prisma.user.upsert({
        where: { email: 'teacher@physicmut.com' },
        update: { role: { connect: { id: userRole.id } } },
        create: { username: 'teacher', email: 'teacher@physicmut.com', password_hash: '123456', full_name: 'Giáo viên Vật Lý', role: { connect: { id: userRole.id } } }
    });
    await prisma.user.upsert({
        where: { email: 'student@physicmut.com' },
        update: { role: { connect: { id: userRole.id } } },
        create: { username: 'student', email: 'student@physicmut.com', password_hash: '123456', full_name: 'Nguyễn Văn A', role: { connect: { id: userRole.id } } }
    });
    // Sample admin users for new roles
    await prisma.user.upsert({
        where: { email: 'teacher.lead@physicmut.com' },
        update: {},
        create: { username: 'teacher_lead', email: 'teacher.lead@physicmut.com', password_hash: '123456', full_name: 'Trưởng nhóm Giáo viên', department: 'Academic', role: { connect: { id: teacherLeadRole.id } } }
    });
    await prisma.user.upsert({
        where: { email: 'designer3d@physicmut.com' },
        update: {},
        create: { username: 'designer_3d', email: 'designer3d@physicmut.com', password_hash: '123456', full_name: 'Nhà thiết kế 3D', department: '3D Lab', role: { connect: { id: designer3DRole.id } } }
    });


    // --- 1. CONTENT CREATION ---
    console.log('Creating 3D Model Content...');

    // Helper to create content — links Theory/Example/Exercise directly to Model3D via model_type_name
    const createModelContent = async (modelData, theories, examples, exercises) => {
        const { model_type_name } = modelData;

        // Inject type name into each content item
        const theoriesWithType = theories.map(t => ({ ...t, theory_type_name: model_type_name }));
        const examplesWithType = examples.map(e => ({ ...e, example_type_name: model_type_name }));
        const exercisesWithType = exercises.map(ex => ({ ...ex, exercise_type_name: model_type_name }));

        await prisma.model3D.create({
            data: {
                ...modelData,
                theories: { create: theoriesWithType },
                examples: { create: examplesWithType },
                exercises: { create: exercisesWithType },
            }
        });
        console.log(`Created Model3D: ${model_type_name}`);
    };

    // 1. CYCLOTRON
    await createModelContent(
        {
            model_type_name: 'CYCLOTRON',
            name: 'Cyclotron',
            description: 'Mô hình 3D Máy gia tốc Cyclotron',
            source_url: '',
            thumbnail_url: '/cyclotron.jpg',
            status: 'ACTIVE',
        },
        [{
            title: 'Lý thuyết mô hình Máy gia tốc hạt Cyclotron',
            content_html: `
<div class="cyclotron-theory">
    <h1 style="text-align: center; color: #2c3e50;">CHUYÊN ĐỀ: MÁY GIA TỐC HẠT CYCLOTRON (XICLÔTRÔN)</h1>

    <section>
        <h2 style="color: #e67e22;">1. Định nghĩa và Cấu tạo</h2>
        <p><strong>Định nghĩa:</strong> Cyclotron là một loại máy gia tốc hạt sử dụng phối hợp điện trường biến thiên và từ trường đều để tăng tốc cho các hạt mang điện (như proton, deuteron, hạt alpha...) di chuyển theo quỹ đạo tròn với bán kính tăng dần theo hình xoắn ốc.</p>
        
        <p><strong>Cấu tạo chính:</strong></p>
        <ul>
            <li><strong>Hai hộp rỗng hình chữ D (Dees):</strong> Là hai điện cực kim loại rỗng hình chữ D, đặt đối diện nhau và cách nhau một khe hở hẹp.</li>
            <li><strong>Từ trường đều (B):</strong> Toàn bộ hệ thống hộp D được đặt trong chân không giữa hai cực của nam châm điện mạnh. Cảm ứng từ B vuông góc với mặt phẳng của các hộp D.</li>
            <li><strong>Nguồn điện xoay chiều (U<sub>~</sub>):</strong> Được nối vào hai hộp D để tạo ra điện trường biến thiên tần số cao tại khe hở giữa hai hộp.</li>
            <li><strong>Nguồn phát hạt:</strong> Đặt ở tâm của máy (khe hở) để phát ra các hạt mang điện cần gia tốc.</li>
        </ul>
    </section>

    <section>
        <h2 style="color: #e67e22;">2. Nguyên lý hoạt động</h2>
        <p>Quá trình gia tốc diễn ra theo chu trình sau:</p>
        <ol>
            <li><strong>Trong lòng hộp D:</strong> Bên trong hộp D là đẳng thế (không có điện trường). Hạt chỉ chịu tác dụng của <strong>lực Lo-ren-xơ</strong> do từ trường B gây ra. Hạt chuyển động tròn đều với bán kính <em>r</em>.</li>
            <li><strong>Tại khe hở:</strong> Khi hạt đi đến khe hở, điện trường giữa hai hộp D đổi chiều sao cho hạt được tăng tốc. Hạt nhận năng lượng từ điện trường, vận tốc <em>v</em> tăng lên.</li>
            <li><strong>Quỹ đạo xoắn ốc:</strong> Khi vận tốc tăng, bán kính quỹ đạo của hạt trong từ trường sẽ tăng theo (do <em>r ~ v</em>). Do đó, hạt di chuyển theo đường xoắn ốc từ tâm ra ngoài.</li>
            <li><strong>Dẫn ra ngoài:</strong> Khi hạt đạt đến bán kính cực đại (mép ngoài của hộp D), nó được dẫn ra khỏi máy qua một cửa sổ để sử dụng.</li>
        </ol>
    </section>

    <section>
        <h2 style="color: #e67e22;">3. Các công thức quan trọng (Dùng cho thi THPT QG)</h2>
        <p>Giả sử hạt có khối lượng <em>m</em>, điện tích <em>q</em>, chuyển động trong từ trường đều <em>B</em>.</p>

        <h3>a. Lực Lo-ren-xơ (Lực hướng tâm)</h3>
        <p>Lực từ tác dụng lên hạt đóng vai trò là lực hướng tâm:</p>
        <p style="background-color: #f1f1f1; padding: 10px; border-left: 5px solid #3498db; text-align: center; overflow-x: auto;">
            $$ F_{ht} = F_{Lorentz} \\Rightarrow m \\cdot \\frac{v^2}{R} = |q| \\cdot v \\cdot B $$
        </p>
        <p><em>Trong đó: \\( v \\) là vận tốc dài, \\( R \\) là bán kính quỹ đạo.</em></p>

        <h3>b. Bán kính quỹ đạo (\\( R \\))</h3>
        <p style="background-color: #f1f1f1; padding: 10px; border-left: 5px solid #3498db; text-align: center; overflow-x: auto;">
            $$ R = \\frac{m \\cdot v}{|q| \\cdot B} $$
        </p>
        <p><em>Nhận xét:</em> Bán kính tỉ lệ thuận với vận tốc. Khi hạt được gia tốc, \\( v \\) tăng thì \\( R \\) tăng theo, tạo thành quỹ đạo xoắn ốc.</p>

        <h3>c. Chu kỳ (\\( T \\)) và Tần số (\\( f \\))</h3>
        <p>Đây là đại lượng quan trọng nhất chứng minh khả năng đồng bộ hóa của Cyclotron.</p>
        <ul>
            <li><strong>Chu kỳ quay:</strong> $$ T = \\frac{2\\pi R}{v} = \\frac{2\\pi m}{|q| \\cdot B} $$</li>
            <li><strong>Tần số Cyclotron (điều kiện đồng bộ):</strong> $$ f = \\frac{1}{T} = \\frac{|q| \\cdot B}{2\\pi \\cdot m} $$</li>
            <li><strong>Tần số góc:</strong> $$ \\omega = \\frac{|q| \\cdot B}{m} $$</li>
        </ul>
        <p><strong>Lưu ý cực kỳ quan trọng:</strong> Chu kỳ và tần số quay <strong>không phụ thuộc</strong> vào vận tốc \\( v \\) và bán kính \\( R \\) (trong phạm vi phi tương đối tính). Điều này cho phép dùng nguồn điện xoay chiều có tần số không đổi để gia tốc hạt liên tục.</p>

        <h3>d. Động năng cực đại (\\( W_{d(max)} \\))</h3>
        <p>Hạt đạt động năng cực đại khi ở mép ngoài cùng của hộp D (bán kính \\( R_{max} \\) của máy):</p>
        <p style="background-color: #f1f1f1; padding: 10px; border-left: 5px solid #3498db; text-align: center; overflow-x: auto;">
            $$ v_{max} = \\frac{|q| \\cdot B \\cdot R_{max}}{m} $$
            $$ W_{d(max)} = \\frac{1}{2} m \\cdot v_{max}^2 = \\frac{|q|^2 \\cdot B^2 \\cdot R_{max}^2}{2m} $$
        </p>
        <p><em>Nhận xét:</em> Động năng cực đại tỉ lệ với bình phương bán kính máy và bình phương cảm ứng từ, <strong>không phụ thuộc</strong> vào hiệu điện thế gia tốc \\( U \\) giữa hai bản cực.</p>

        <h3>e. Số vòng quay (\\( N \\))</h3>
        <p>Giả sử hiệu điện thế giữa hai khe hở là \\( U \\). Mỗi vòng quay hạt đi qua khe 2 lần, mỗi lần nhận năng lượng \\( |q| \\cdot U \\). Tổng động năng đạt được:</p>
        <p style="text-align: center;">$$ W_{d(max)} = N \\cdot (2|q| \\cdot U) \\Rightarrow N = \\frac{W_{d(max)}}{2|q| \\cdot U} $$</p>
    </section>

    <section>
        <h2 style="color: #e67e22;">4. Ứng dụng thực tế</h2>
        <ul>
            <li><strong>Y học hạt nhân:</strong> Sản xuất đồng vị phóng xạ phục vụ chẩn đoán (PET/CT) và điều trị ung thư (Xạ trị hạt - Particle therapy).</li>
            <li><strong>Nghiên cứu vật lý:</strong> Tạo chùm hạt năng lượng cao để bắn phá hạt nhân, nghiên cứu cấu trúc vật chất.</li>
        </ul>
    </section>

    <section>
        <h2 style="color: #e67e22;">5. Các dạng câu hỏi thường gặp</h2>
        <ul>
            <li><strong>Dạng 1 - Điều kiện cộng hưởng:</strong> Tần số của nguồn điện xoay chiều phải bằng tần số quay của hạt: f<sub>điện</sub> = f<sub>hạt</sub> = (|q|B) / (2&pi;m).</li>
            <li><strong>Dạng 2 - Yếu tố ảnh hưởng động năng cuối cùng:</strong> Chỉ phụ thuộc vào bán kính máy (R) và từ trường (B), không phụ thuộc vào hiệu điện thế U.</li>
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

        [{
            title: 'Bài toán Cyclotron ',
            problem: `
<p>
    Máy cyclotron là một loại máy gia tốc hạt sử dụng từ trường và điện trường để tăng tốc các hạt tích điện theo quỹ đạo có bán kính tăng dần. Thiết bị này được ứng dụng rộng rãi trong y học hạt nhân và nghiên cứu vật lý hạt. Hình bên mô tả cấu tạo một máy cyclotron gồm có hai hộp rỗng hình chữ D (hai cực \\( D_1 \\) và \\( D_2 \\)) làm bằng đồng ghép với nhau thành một hình tròn được đặt trong chân không từ trường đều có cảm ứng từ \\( B \\) vuông góc với mặt hộp. Hai cạnh thẳng đứng của các hộp D không đặt sát nhau mà cách nhau một khoảng hẹp, ở giữa khoảng hẹp có một điện trường \\( E \\). Điện tích phóng ra ở gần tâm máy được tăng tốc trực tiếp bởi lực điện khi đi qua điện trường giữa hai hộp D. Xét chuyển động của hạt Deuteron trong một máy cyclotron khi nó đang ở cực \\( D_1 \\) và bay theo phương vuông góc với các đường sức từ, lực từ tác dụng lên hạt có độ lớn \\( F = Bv|q| \\), có phương vuông góc với cảm ứng từ \\( B \\) và vận tốc \\( v \\) của hạt, cho tốc độ của hạt khi đó là \\( 3,2 \\cdot 10^6 \\text{ m/s} \\). Biết Deuteron có khối lượng là \\( m = 3,31 \\cdot 10^{-27} \\text{ kg} \\) và điện tích \\( q = +1,6 \\cdot 10^{-19} \\text{ C} \\). Hiệu điện thế giữa hai cực \\( D_1, D_2 \\) là \\( 100 \\text{ kV} \\) và độ lớn cảm ứng từ \\( B \\) là \\( 2,0 \\text{ T} \\). Lấy \\( \\pi = 3,14 \\) trong các phép tính có dùng đến số \\( \\pi \\). Sau 150 lần (kể từ lúc bắt đầu chuyển động của Deuteron) tăng tốc bởi điện trường thì bán kính quỹ đạo của Deuteron là bao nhiêu cm (kết quả làm tròn đến hàng phần mười).
</p>
            `,
            solution: `
<h1>Lời Giải: Bài Toán Máy Gia Tốc Cyclotron</h1>

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
            // Base Problem
            {
                question: `<p>Một máy gia tốc hạt <strong>Cyclotron</strong> gồm hai hộp rỗng bằng kim loại hình chữ D cách nhau một khe hẹp như hình vẽ. Vùng không gian trong mỗi hộp D có từ trường đều với cảm ứng từ $B = 0,6\\,\\text{T}$, đường sức từ vuông góc với mặt hộp D. Đặt một điện áp xoay chiều thích hợp $u$ vào máy để các hạt điện tích được tăng tốc mỗi lần chúng bay qua khe.</p>

<p>Trong thí nghiệm, một chùm hạt được gia tốc, thời gian mỗi lần một điện tích $q$ chuyển động được $0,5$ vòng trong hộp D là $5\\cdot 10^{-8}\\,\\text{s}$. Trong lần cuối cùng trước khi thoát khỏi máy, quỹ đạo hạt có bán kính $0,5\\,\\text{m}$ và cường độ trung bình $I = 4,2\\,\\text{mA}$, sau đó chúng bay ra đập vào một cái bia.</p>

<p>Biết rằng $80\\%$ động năng của hạt chuyển hóa thành nhiệt làm nóng bia; toàn bộ nhiệt lượng bia nhận được lại được hấp thụ bởi dòng nước chảy qua bia có lưu lượng ổn định.</p>

<p>Cho khối lượng điện tích là $m$, bỏ qua tác dụng của trọng lực lên điện tích, không xét đến sự thay đổi khối lượng tương đối tính; lực từ tác dụng lên điện tích $q$ chuyển động với vận tốc $v$ theo phương vuông góc với cảm ứng từ $B$ có độ lớn $f = Bv|q|$; nhiệt dung riêng của nước là $c = 4200\\,\\text{J/kg.K}$; khối lượng riêng của nước là $\\rho = 1000\\,\\text{kg/m}^3$.</p>

<p><strong>a)</strong> Trong mỗi hộp D, bán kính quỹ đạo của điện tích được xác định bằng biểu thức $R = \\dfrac{mv}{B|q|}$.</p>

<p><strong>b)</strong> Có thể thay đổi bán kính quỹ đạo của điện tích bằng cách điều chỉnh điện áp xoay chiều đặt vào máy.</p>

<p><strong>c)</strong> Trong mỗi hộp D, lực do từ trường tác dụng lên mỗi điện tích có tác dụng tăng tốc cho điện tích.</p>

<p><strong>d)</strong> Nếu dòng nước ngay sau khi làm mát bia được tăng thêm $10^\\circ\\text{C}$ thì lưu lượng của dòng nước này là $0,967\\,\\text{lít/giây}$.</p>`,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đề Sở GD Nam Định 2025',
                solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`
            },

            // PROBLEM 1 & 2 (Identical in text, mapped as one)
            {
                question: `
<p> Xiclôtrôn là máy gia tốc gồm hai hộp rỗng bằng kim loại hình chữ D, cách nhau một khe (hình vẽ). Có một từ trường với cảm ứng từ vectơ B không đổi vuông góc với mặt hộp. Gần tâm của hai hộp đó có nguồn phát ra hạt tích điện dương với vectơ vận tốc v vuông góc với vectơ B. Biết khối lượng <em>m</em> và điện tích <em>q</em> của hạt.</p>

<p><strong>a)</strong> Chứng minh rằng quỹ đạo của hạt trong từ trường là đường tròn. Tính bán kính đường tròn này.</p>

<p><strong>b)</strong> Có một hiệu điện thế xoay chiều đặt vào hai hộp D với tần số thích hợp để hạt được tăng tốc mỗi lần đi qua khe. Quỹ đạo của hạt gần giống đường xoắn ốc. Chính xác thì quỹ đạo ấy có dạng như thế nào?</p>

<p><strong>c)</strong> Tính tần số quay của hạt, cho nhận xét về tần số này. Tần số của điện áp xoay chiều phải bằng bao nhiêu để hạt được tăng tốc mỗi lần qua khe? Trong phần dưới đây, xét trường hợp gia tốc hạt prôtôn có khối lượng $m_p = 1,66 \\cdot 10^{-27} \\text{ kg}$ và điện tích $e = 1,6 \\cdot 10^{-19} \\text{C}$. Điện áp đặt vào các hộp D có tần số $f = 10^{7} \\text{ Hz}$. Vòng cuối cùng của prôtôn trước khi ra khỏi xiclôtrôn có bán kính 0,42 m.</p>

<p><strong>d)</strong> Tính cảm ứng từ B và động năng cuối cùng của prôtôn.</p>

<p><strong>e)</strong> Cực đại của điện áp giữa các hộp D là 20 kV. Tính số vòng mà prôtôn đã quay trước khi ra khỏi xiclôtrôn.</p>
                `,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                status: 'ACTIVE',
                solution: `
<p><strong>a)</strong> Khi hạt điện tích dương<em>q</em> bay vào từ trường đều <em> B</em> với vận tốc <em> v</em> vuông góc với <em> B</em>, hạt chịu tác dụng của lực Lo - ren - xơ có độ lớn <em> F = | q | vB</em>.Lực này luôn vuông góc với véc - tơ vận tốc nên không sinh công, chỉ làm thay đổi hướng chuyển động và đóng vai trò là lực hướng tâm <em> F <sub> ht</sub> = mv <sup> 2</sup> /R</em>.Do đó, quỹ đạo của hạt là một đường tròn.Bán kính quỹ đạo được xác định từ phương trình <em> F = F <sub> ht</sub></em>, suy ra <em> R = mv / (| q | B)</em>.</p>

<p><strong>b)</strong> Bên trong hai hộp chữ D (nơi được che chắn điện trường, chỉ có từ trường), hạt chuyển động theo các quỹ đạo nửa đường tròn. Mỗi khi đi qua khe hở giữa hai hộp, điện trường xoay chiều thực hiện công làm tăng tốc độ của hạt. Vì bán kính <em>R</em> tỉ lệ thuận với vận tốc <em>v</em>, nên sau mỗi lần được gia tốc qua khe, bán kính quỹ đạo của hạt lại lớn hơn. Chính vì vậy, quỹ đạo của hạt là sự ghép nối của các nửa đường tròn có bán kính tăng dần, tạo thành một đường trôn ốc từ tâm mở rộng ra ngoài.</p>

<p><strong>c)</strong> Tần số quay của hạt (số vòng quay trong 1 giây) được tính bằng <em>f<sub>p</sub> = v / (2&pi;R)</em>. Thay biểu thức bán kính vào, ta có <em>f<sub>p</sub> = |q|B / (2&pi;m)</em>. <strong>Nhận xét:</strong> Tần số quay của hạt là một hằng số, hoàn toàn không phụ thuộc vào vận tốc hay bán kính quỹ đạo của nó. Để hạt được tăng tốc liên tục mỗi khi đi qua khe, tần số của điện áp xoay chiều phải luôn đồng bộ và bằng với tần số quay của hạt, tức là <em>f = |q|B / (2&pi;m)</em>.</p>

<p><strong>d)</strong> <br>
Từ công thức tần số, cảm ứng từ B là <em>B = 2&pi;m<sub>p</sub>f / e</em>. Thay số ta được <em>B = (2 &cdot; 3,14 &cdot; 1,66&cdot;10<sup>-27</sup> &cdot; 10<sup>7</sup>) / 1,6&cdot;10<sup>-19</sup> &approx; 0,65 T</em>. <br>
Vận tốc cực đại của prôtôn khi đạt bán kính quỹ đạo ngoài cùng <em>R<sub>max</sub> = 0,42 m</em> là <em>v<sub>max</sub> = 2&pi;fR<sub>max</sub></em>. <br>
Động năng cuối cùng của prôtôn là <em>W<sub>đ</sub> = 1/2 m<sub>p</sub>v<sub>max</sub><sup>2</sup> = 2&pi;<sup>2</sup>m<sub>p</sub>f<sup>2</sup>R<sub>max</sub><sup>2</sup></em>. <br>
Thay số ta tính được <em>W<sub>đ</sub> = 2 &cdot; (3,14)<sup>2</sup> &cdot; 1,66&cdot;10<sup>-27</sup> &cdot; (10<sup>7</sup>)<sup>2</sup> &cdot; (0,42)<sup>2</sup> &approx; 5,77&cdot;10<sup>-13</sup> J</em> (tương đương khoảng 3,6 MeV).</p>

<p><strong>e)</strong> Mỗi lần đi qua khe hở, prôtôn được nhận thêm năng lượng <em>&Delta;W<sub>1</sub> = eU</em>. Trong mỗi một vòng quay hoàn chỉnh, hạt đi qua khe 2 lần, do đó năng lượng tăng thêm trong một vòng là <em>&Delta;W = 2eU</em>. <br>
Thay số, độ tăng năng lượng mỗi vòng là <em>&Delta;W = 2 &cdot; 1,6&cdot;10<sup>-19</sup> &cdot; 20&cdot;10<sup>3</sup> = 6,4&cdot;10<sup>-15</sup> J</em>. <br>
Số vòng mà prôtôn đã quay trước khi bay ra khỏi xiclôtrôn là <em>N = W<sub>đ</sub> / &Delta;W = (5,77&cdot;10<sup>-13</sup>) / (6,4&cdot;10<sup>-15</sup>) &approx; 90</em> vòng.</p>
                `
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
                solution: `
<p><strong>Câu I:</strong> Để hạt được tăng tốc liên tục sau mỗi nửa vòng quay, tần số của nguồn điện xoay chiều đặt vào hai hộp D phải đồng bộ và bằng tần số quay của electron trong từ trường (tần số cyclotron). Lực Lo-ren-xơ đóng vai trò lực hướng tâm: <em>eBv = mv<sup>2</sup>/r &rArr; &omega; = v/r = eB/m</em>. Tần số của nguồn điện là <em>f = &omega; / (2&pi;) = eB / (2&pi;m)</em>. <br><strong>&rArr; Chọn B.</strong></p>

<p><strong>Câu II:</strong> Tốc độ của hạt tỉ lệ thuận với bán kính quỹ đạo. Hạt đạt tốc độ cực đại khi quỹ đạo của nó mở rộng đến bán kính cực đại ngoài cùng là <em>R</em>. Từ hệ thức <em>v = eBr/m</em>, ta suy ra tốc độ cực đại <em>v<sub>max</sub> = eBR/m</em>. <br><strong>&rArr; Chọn C.</strong></p>

<p><strong>Câu III:</strong> Động năng cực đại của hạt khi rời khỏi máy gia tốc là <em>W<sub>đ,max</sub> = 1/2 mv<sub>max</sub><sup>2</sup> = e<sup>2</sup>B<sup>2</sup>R<sup>2</sup> / (2m)</em>. Biểu thức này chỉ phụ thuộc vào <em>R</em>, <em>B</em> và bản chất của hạt (<em>m, e</em>), hoàn toàn không phụ thuộc vào <em>U</em>. Do đó, nếu chỉ tăng <em>U</em>, động năng cực đại của hạt sẽ không thay đổi.</p>
<p>Mặt khác, mỗi lần đi qua khoảng hở giữa 2 hộp D, hạt nhận được thêm một phần năng lượng bằng công của lực điện trường <em>A = eU</em>. Khi <em>U</em> tăng, năng lượng hạt nhận được trong mỗi vòng quay lớn hơn, dẫn đến tổng số vòng quay cần thiết để tích lũy đến động năng cực đại sẽ giảm đi. Vì chu kì quay <em>T</em> của hạt trong từ trường là một hằng số (không phụ thuộc vận tốc), nên tổng thời gian để hạt đạt động năng cực đại sẽ giảm. <br><strong>&rArr; Chọn D.</strong></p>
        
                `
            },
            // PROBLEM 4
            {
                question: `
<p> Hai hạt khác nhau được tăng tốc bằng máy gia tốc cyclotron. Độ lớn cảm ứng từ của từ trường vuông góc với mặt hộp D không đổi, tần số của điện áp xoay chiều có thể điều chỉnh theo tần số chuyển động tròn của hai hạt.</p> <ul> <li>A. Hạt có điện tích lớn hơn có động lượng cuối cùng lớn hơn.</li> <li>B. Hạt có điện tích nhỏ hơn có động lượng cuối cùng lớn hơn.</li> <li>C. Hạt có điện tích lớn hơn có động năng cuối cùng lớn hơn.</li> <li>D. Hạt có điện tích nhỏ hơn có động năng cuối cùng lớn hơn.</li> </ul>
                `,
                options: [{ id: "A", text: "A" }, { id: "B", text: "B" }, { id: "C", text: "C" }, { id: "D", text: "D" }], // Simplified options
                correct_answer: "A",
                level: 'MEDIUM',
                type: 'MultipleChoice',
                status: 'ACTIVE',
                solution: `
<p><strong>Giải thích:</strong></p>
<p>Khi hạt chuyển động trong máy gia tốc cyclotron, lực từ (lực Lo-ren-xơ) đóng vai trò là lực hướng tâm: <em>|q|vB = mv<sup>2</sup>/R</em>.</p>
<p>Động lượng của hạt tại quỹ đạo bán kính <em>R</em> là: <em>p = mv = |q|BR</em>.</p>
<p>Hai hạt khác nhau được gia tốc trong cùng một máy cyclotron sẽ đạt trạng thái cuối cùng khi bán kính quỹ đạo đạt giá trị cực đại bằng bán kính của hộp D (<em>R = R<sub>max</sub></em>). Do đó, động lượng cuối cùng cực đại của hạt là: <em>p<sub>max</sub> = |q|BR<sub>max</sub></em>.</p>
<p>Vì cảm ứng từ <em>B</em> và bán kính <em>R<sub>max</sub></em> của máy là không đổi, động lượng cuối cùng tỉ lệ thuận với độ lớn điện tích <em>|q|</em> của hạt. Vậy hạt có điện tích lớn hơn chắc chắn sẽ có động lượng cuối cùng lớn hơn. <strong>&rArr; Phương án A đúng, B sai.</strong></p>
<p>Đối với động năng cuối cùng của hạt: <em>W<sub>đ,max</sub> = p<sub>max</sub><sup>2</sup> / (2m) = q<sup>2</sup>B<sup>2</sup>R<sub>max</sub><sup>2</sup> / (2m)</em>. Động năng phụ thuộc vào cả điện tích <em>q</em> và khối lượng <em>m</em>. Vì đề bài chỉ cho "hai hạt khác nhau" mà không cung cấp thông tin về tỉ số khối lượng của chúng, ta không thể kết luận hạt nào có động năng lớn hơn. <strong>&rArr; Phương án C và D sai.</strong></p>
<p><strong>&rArr; Chọn A.</strong></p>
                `
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
                solution: `
                <p><strong>a) Sai.</strong> Trong một chu kì quay hoàn chỉnh, quỹ đạo của hạt gồm hai nửa đường tròn nằm trong hai hộp D. Hạt sẽ đi qua khoảng hở giữa hai hộp D hai lần. Do đó, trong mỗi chu kì, proton được tăng tốc hai lần chứ không phải một lần.</p>

<p><strong>b) Sai.</strong> Khi proton chuyển động trong từ trường, lực từ (lực Lo-ren-xơ) đóng vai trò là lực hướng tâm: <em>evB = m(v<sup>2</sup>/r)</em>, suy ra tốc độ góc <em>&omega; = v/r = eB/m</em>. Tần số quay của proton trong từ trường là <em>f = &omega;/(2&pi;) = eB / (2&pi;m)</em>. Để hạt liên tục được tăng tốc, tần số của điện áp xoay chiều phải bằng tần số quay của hạt, tức là <em>f = eB / (2&pi;m)</em> chứ không phải <em>eB/(&pi;m)</em>.</p>

<p><strong>c) Đúng.</strong> Vận tốc cực đại của proton đạt được khi hạt chuyển động ở quỹ đạo ngoài cùng có bán kính bằng bán kính của hộp D (<em>r = R</em>). Từ biểu thức lực hướng tâm, ta có vận tốc cực đại <em>v<sub>max</sub> = eBR/m</em>. Động năng cực đại mà proton đạt được là: <em>W<sub>đ,max</sub> = 1/2 mv<sub>max</sub><sup>2</sup> = 1/2 m(eBR/m)<sup>2</sup> = (e<sup>2</sup>B<sup>2</sup>R<sup>2</sup>) / (2m)</em>.</p>

<p><strong>d) Đúng.</strong> Mỗi lần đi qua khe hở giữa hai hộp D, proton được điện trường thực hiện công và tăng thêm một lượng năng lượng là <em>&Delta;W = eU</em>. Tổng số lần proton đi qua khe (tương ứng với số nửa vòng quay) để đạt được động năng cực đại là: <em>N = W<sub>đ,max</sub> / &Delta;W = (e<sup>2</sup>B<sup>2</sup>R<sup>2</sup>) / (2m &cdot; eU) = (eB<sup>2</sup>R<sup>2</sup>) / (2mU)</em>. Thời gian proton chuyển động trong mỗi nửa vòng quay là một nửa chu kì: <em>t<sub>1/2</sub> = T/2 = &pi;/&omega; = (&pi;m) / (eB)</em>. Vậy tổng thời gian proton chuyển động trong máy gia tốc (bỏ qua thời gian bay qua khe) là: <em>t = N &cdot; t<sub>1/2</sub> = [(eB<sup>2</sup>R<sup>2</sup>) / (2mU)] &cdot; [(&pi;m) / (eB)] = (&pi;BR<sup>2</sup>) / (2U)</em>.</p>
        
                `
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
                solution: `
                <p><strong>a) Sai.</strong> Năng lượng hạt nhận được để tăng tốc đúng là do công của điện trường cung cấp. Tuy nhiên, động năng cực đại của hạt khi bay ra khỏi máy gia tốc đạt được khi quỹ đạo bằng bán kính hộp D: <em>W<sub>đ,max</sub> = q<sup>2</sup>B<sup>2</sup>R<sup>2</sup> / (2m)</em>. Biểu thức này cho thấy động năng cực đại chỉ phụ thuộc vào bản chất của hạt (<em>q, m</em>) và thông số máy (<em>B, R</em>), hoàn toàn <strong>không phụ thuộc</strong> vào hiệu điện thế <em>U</em>.</p>

<p><strong>b) Đúng.</strong> Khi hạt chuyển động trong từ trường, lực Lo-ren-xơ đóng vai trò là lực hướng tâm, ta có chu kì quay của hạt là: <em>T = 2&pi;r/v = 2&pi;m / (qB)</em>. Để quá trình tăng tốc diễn ra liên tục và đồng bộ sau mỗi nửa vòng quay, chu kì của hiệu điện thế xoay chiều đặt vào hai hộp D phải bằng chính chu kì quay của hạt trong từ trường.</p>

<p><strong>c) Đúng.</strong> Vận tốc cực đại của hạt đạt được ở quỹ đạo ngoài cùng (khi bán kính quỹ đạo đạt cực đại bằng bán kính <em>R</em> của hộp D). Từ hệ thức lực từ bằng lực hướng tâm: <em>qv<sub>max</sub>B = m(v<sub>max</sub><sup>2</sup>/R)</em>, ta dễ dàng suy ra được tốc độ cực đại <em>v<sub>max</sub> = qBR/m</em>.</p>

<p><strong>d) Sai.</strong> Mỗi lần đi qua khe hở giữa hai hộp, điện trường sinh công giúp hạt nhận thêm năng lượng <em>&Delta;W = qU</em>. Tổng số lần hạt qua khe để đạt đến động năng cực đại <em>W<sub>đ,max</sub></em> là <em>N = W<sub>đ,max</sub> / (qU)</em>. Nếu tăng <em>U</em>, số lần qua khe <em>N</em> (tương ứng với số nửa vòng quay cần thiết) sẽ giảm. Vì chu kì quay của mỗi vòng là hằng số không phụ thuộc vận tốc, tổng thời gian hạt chuyển động trong máy sẽ <strong>ngắn lại</strong> chứ không phải dài hơn.</p>
        
                `
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
                solution: `
                <p><strong>a) Đúng.</strong> Điện trường tồn tại trong khoảng hở giữa hai hộp D sinh công làm tăng động năng của hạt ($A = qU$), do đó làm thay đổi tốc độ của hạt. Từ trường trong các hộp D vuông góc với vận tốc nên lực Lo-ren-xơ chỉ đóng vai trò làm đổi hướng chuyển động (lực hướng tâm) chứ không sinh công, không làm thay đổi tốc độ.</p>

<p><strong>b) Đúng.</strong> Bán kính quỹ đạo ban đầu tại cực $D_1$ được tính bằng công thức lực hướng tâm bằng lực Lo-ren-xơ: $R_1 = \\frac{mv_1}{qB}$. <br> Thay số: $R_1 = \\frac{3,31 \\cdot 10^{-27} \\cdot 3,2 \\cdot 10^6}{1,6 \\cdot 10^{-19} \\cdot 1,6} = 0,041375 \\text{ m} = 4,1375 \\text{ cm}$.</p>

<p><strong>c) Đúng.</strong> Động năng ban đầu của hạt tại $D_1$: <br> $W_{d1} = \\frac{1}{2}mv_1^2 = \\frac{1}{2} \\cdot 3,31 \\cdot 10^{-27} \\cdot (3,2 \\cdot 10^6)^2 = 16,9472 \\cdot 10^{-15} \\text{ J}$. <br> Công của điện trường thực hiện trong 1 lần hạt bay qua khe hở (1 lần gia tốc) là: <br> $A = qU = 1,6 \\cdot 10^{-19} \\cdot 100 \\cdot 10^3 = 16 \\cdot 10^{-15} \\text{ J}$. <br> Động năng của hạt sau lần tăng tốc thứ nhất (khi sang cực $D_2$): <br> $W_{d2} = W_{d1} + A = 16,9472 \\cdot 10^{-15} + 16 \\cdot 10^{-15} = 32,9472 \\cdot 10^{-15} \\text{ J}$. <br> Bán kính quỹ đạo lúc này: <br> $R_2 = \\frac{mv_2}{qB} = \\frac{\\sqrt{2mW_{d2}}}{qB} = \\frac{\\sqrt{2 \\cdot 3,31 \\cdot 10^{-27} \\cdot 32,9472 \\cdot 10^{-15}}}{1,6 \\cdot 10^{-19} \\cdot 1,6} \\approx 0,05769 \\text{ m} \\approx 5,8 \\text{ cm}$.</p>

<p><strong>d) Sai.</strong> Bán kính cực đại mà cyclotron có thể đạt được là $R_{max} = 50 \\text{ cm} = 0,5 \\text{ m}$. <br> Động năng cực đại của hạt deuterium đạt được khi bay ra khỏi máy: <br> $W_{d,max} = \\frac{q^2 B^2 R_{max}^2}{2m} = \\frac{(1,6 \\cdot 10^{-19} \\cdot 1,6 \\cdot 0,5)^2}{2 \\cdot 3,31 \\cdot 10^{-27}} \\approx 2,4749 \\cdot 10^{-12} \\text{ J} = 2474,9 \\cdot 10^{-15} \\text{ J}$. <br> Tổng năng lượng mà điện trường đã truyền cho hạt để đạt đến động năng cực đại là: <br> $\\Delta W = W_{d,max} - W_{d1} = 2474,9 \\cdot 10^{-15} - 16,9472 \\cdot 10^{-15} = 2457,9528 \\cdot 10^{-15} \\text{ J}$. <br> Số lần hạt được điện trường tăng tốc (số lần bay qua khe): <br> $n = \\frac{\\Delta W}{A} = \\frac{2457,9528 \\cdot 10^{-15}}{16 \\cdot 10^{-15}} \\approx 153,6$ lần. <br> Như vậy hạt chỉ được tăng tốc khoảng 153-154 lần chứ không phải 189 lần.</p>
        
                `
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
                solution: `
                <p><strong>a) Sai.</strong> Trong quá trình chuyển động ở máy cyclotron, proton chịu tác dụng của lực từ (lực Lo-ren-xơ) khi ở bên trong hai hộp D (giúp hạt chuyển động theo quỹ đạo tròn) và chịu tác dụng của lực điện trường khi đi qua khoảng hở giữa hai cạnh thẳng của hai hộp D (để gia tốc làm tăng vận tốc của hạt).</p>

<p><strong>b) Sai.</strong> Theo đoạn văn mô tả và công thức $R = \\frac{mv}{Bq}$, mỗi lần đi qua khoảng hở giữa hai hộp D, proton được điện trường tăng tốc nên vận tốc $v$ tăng. Do $v$ tăng, bán kính quỹ đạo $R$ cũng lớn hơn trước. Quỹ đạo của hạt là một đường xoắn ốc mở rộng dần chứ không phải là quỹ đạo có bán kính không đổi.</p>

<p><strong>c) Đúng.</strong> Từ hệ thức điều kiện đồng bộ $qB = 2\\pi m f_{dd}$, ta tính được độ lớn cảm ứng từ $B$ cần thiết: <br>
$B = \\frac{2\\pi m f_{dd}}{q} = \\frac{2 \\cdot \\pi \\cdot 1,67 \\cdot 10^{-27} \\cdot 12 \\cdot 10^6}{1,6 \\cdot 10^{-19}} \\approx 0,7869... \\text{ T} \\approx 0,787 \\text{ T}$.</p>

<p><strong>d) Đúng.</strong> Năng lượng proton thu được khi rời khỏi máy chính là động năng cực đại của nó, đạt được khi bán kính quỹ đạo mở rộng bằng bán kính của hộp D ($R_{max} = 53 \\text{ cm} = 0,53 \\text{ m}$). <br>
Vận tốc cực đại của proton là: $v_{max} = 2\\pi f_{dd} R_{max}$. <br>
Động năng cực đại: $W_{d} = \\frac{1}{2}mv_{max}^2 = \\frac{1}{2}m(2\\pi f_{dd} R_{max})^2 = 2\\pi^2 m f_{dd}^2 R_{max}^2$. <br>
Thay số: $W_{d} = 2 \\cdot \\pi^2 \\cdot 1,67 \\cdot 10^{-27} \\cdot (12 \\cdot 10^6)^2 \\cdot (0,53)^2 \\approx 1,333 \\cdot 10^{-12} \\text{ J}$. <br>
Đổi sang đơn vị eV (với $1 \\text{ eV} = 1,6 \\cdot 10^{-19} \\text{ J} \\Rightarrow 1 \\text{ MeV} = 1,6 \\cdot 10^{-13} \\text{ J}$): <br>
$W_{d} = \\frac{1,333 \\cdot 10^{-12}}{1,6 \\cdot 10^{-13}} \\approx 8,33 \\text{ MeV} \\approx 8,3 \\text{ MeV}$.</p>
        
                `
            },
            {
                question: `<p>Trong một số nghiên cứu hạt nhân, người ta cần gia tốc các hạt tích điện như proton, đơteron, electron, các ion,... để các hạt đó có năng lượng đủ lớn gây ra phản ứng hạt nhân. Một trong các thiết bị gia tốc hạt là máy gia tốc <strong>xiclotron</strong>.</p>

<p><strong>Xiclotron</strong> gồm một hình trụ rỗng bằng kim loại được cắt thành hai phần theo đường kính, gọi là các cực đề hay cực D. Cả hệ thống được đặt trong từ trường đều không đổi có cảm ứng từ $B$ vuông góc với mặt phẳng của các cực. Hai cực này được nối với nguồn điện xoay chiều tần số cao để tạo một điện trường xoay chiều ở khe giữa chúng.</p>

<p>Hạt tích điện cần gia tốc được tạo thành ở tâm hai cực, đi vào các cực D rỗng và chuyển động trong đó theo quỹ đạo tròn với tốc độ không đổi. Hạt chỉ được gia tốc mỗi khi đi qua khe giữa các cực D nếu chiều chuyển động phù hợp với chiều của điện trường. Để có sự cộng hưởng đó, tần số góc của chuyển động tròn của hạt phải bằng tần số góc của điện trường xoay chiều.</p>

<p>Kết quả là hạt chuyển động theo đường xoắn ốc và được lái ra ngoài qua cửa sổ $W$ bởi bộ phận lái $L$.</p>

<p>Do khối lượng của hạt phụ thuộc vào tốc độ nên tần số góc của hạt thay đổi, dẫn đến sự cộng hưởng bị phá vỡ. Để không xảy ra sự mất đồng bộ pha trong xiclotron, người ta có thể thay đổi tần số của điện trường xoay chiều mà vẫn giữ từ trường không đổi. Khi đó ta có máy gia tốc <strong>phazotron</strong>.</p>

<p>Nếu dùng phazotron để gia tốc đơteron thì cần thay đổi tần số của điện trường theo thời gian như thế nào, biết rằng cứ sau mỗi vòng quay, hạt nhận được năng lượng trung bình là $\\Delta$?</p>

<p>Để động năng của hạt đạt đến $200\\,\\text{MeV}$ thì tần số của điện trường thay đổi bao nhiêu phần trăm? Bỏ qua động năng ban đầu của hạt.</p>

<p>Cho biết năng lượng nghỉ của đơteron là:</p>

<p>\\[
E_d = 1876\\,\\text{MeV}
\\]</p>`,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                reference: 'Olympic Vật lý Sinh viên Toàn quốc – Hà Nội 2010',
                solution: `<p>Ký hiệu $E$ là năng lượng của hạt, $\\Delta$ là năng lượng hạt nhận được sau một vòng quay, $\\omega$ là tần số góc của nó. Tốc độ tăng năng lượng của hạt là:</p>

<p>\\[
\\frac{dE}{dt} = \\frac{\\omega\\Delta}{2\\pi}
\\tag{1}
\\]</p>

<p>Mặt khác:</p>

<p>\\[
\\omega = \\frac{c^2qB}{E}
\\tag{2}
\\]</p>

<p>Do đó:</p>

<p>\\[
E_d + \\int_0^t dt\\,\\frac{\\omega\\Delta}{2\\pi}
= \\frac{c^2qB}{\\omega}
\\tag{3}
\\]</p>

<p>Do $B = \\text{const}$, lấy đạo hàm hai vế của (3) theo $t$, ta nhận được phương trình:</p>

<p>\\[
\\frac{1}{\\omega^3}\\frac{d\\omega}{dt}
= -\\frac{1}{2}\\frac{d}{dt}\\left(\\frac{1}{\\omega^2}\\right)
= -\\frac{\\Delta}{2\\pi c^2qB}
\\]</p>

<p>hay:</p>

<p>\\[
\\frac{d}{dt}\\left(\\frac{1}{\\omega^2}\\right)
= \\frac{\\Delta}{\\pi c^2qB}
\\tag{4}
\\]</p>

<p>Cuối cùng, ta nhận được biểu thức biểu diễn sự phụ thuộc vào thời gian của tần số góc của hạt, tức là tần số của điện trường:</p>

<p>\\[
\\omega(t) = \\frac{\\omega_0}{\\sqrt{At + 1}}
\\]</p>

<p>với:</p>

<p>\\[
A = \\frac{\\omega_0^2\\Delta}{\\pi c^2qB}
\\tag{5}
\\]</p>

<p>Trong đó $\\omega_0$ là tần số tại $t = 0$.</p>

<p>Từ (2) ta rút ra:</p>

<p>\\[
\\left|\\frac{\\omega - \\omega_0}{\\omega_0}\\right|
=
\\left|\\frac{E - E_d}{E}\\right|
\\approx 9,6\\%
\\]</p>`
            },
            {
                question: `<p><strong>4.11</strong> Trong một buồng thí nghiệm, duy trì một từ trường đều có độ lớn:</p>

<p>\\[
B = 6.5\\,\\text{G}
\\]</p>

<p>với:</p>

<p>\\[
1\\,\\text{G} = 10^{-4}\\,\\text{T}
\\]</p>

<p>Một electron được bắn vào từ trường với vận tốc:</p>

<p>\\[
v = 4.8 \\times 10^6\\,\\text{m/s}
\\]</p>

<p>vuông góc với từ trường.</p>

<p>Hãy giải thích vì sao quỹ đạo của electron là một đường tròn. Xác định bán kính quỹ đạo tròn của electron.</p>

<p>Cho:</p>

<p>\\[
e = 1.5\\times10^{-19}\\,\\text{C}
\\]</p>

<p>\\[
m_e = 9.1\\times10^{-31}\\,\\text{kg}
\\]</p>

<hr/>

<p><strong>4.12</strong> Dựa trên dữ kiện của Bài 4.11, hãy xác định tần số quay của electron trên quỹ đạo tròn của nó.</p>

<p>Tần số này có phụ thuộc vào vận tốc của electron hay không? Hãy giải thích.</p>`,
                options: [],
                correct_answer: "",
                level: 'MEDIUM',
                type: 'Essay',
                reference: 'NCERT Physics XII Chapter 4 PDF - Moving Charges and Magnetism, NCERT; Exercise 4.11 & 4.12, tr. 135',
                solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`
            }
        ]
    );

    // 2. LOUDSPEAKER (Loa điện động)
    await createModelContent(
        {
            model_type_name: 'LOUDSPEAKER',
            name: 'Loa điện động',
            description: 'Mô hình 3D Loa điện động',
            source_url: '',
            thumbnail_url: '/loadiendong.png',
            status: 'ACTIVE'
        },
        [{
            title: 'Lý thuyết mô hình Loa điện động',
            content_html: `
<div class="loudspeaker-theory" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto;">
    <h1 style="text-align: center; color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 10px;">CHUYÊN ĐỀ: LOA ĐIỆN ĐỘNG (DYNAMIC LOUDSPEAKER)</h1>

    <section>
        <h2 style="color: #2980b9;">1. Định nghĩa và Cấu tạo</h2>
        <p><strong>Định nghĩa:</strong> Loa điện động là một thiết bị biến đổi tín hiệu điện (dao động điện) thành tín hiệu âm thanh (dao động cơ học của sóng âm) có cùng tần số.</p>
        
        <p><strong>Cấu tạo chính:</strong></p>
        <ul>
            <li><strong>Nam châm vĩnh cửu (Magnet):</strong> Thường là nam châm hình tròn hoặc hình trụ, được cố định vào khung loa. Chức năng là tạo ra một từ trường mạnh và đều (B) trong khe từ (khe hở).</li>
            <li><strong>Cuộn dây (Voice Coil/Cuộn âm):</strong> Là một ống dây dẫn nhẹ, được đặt trong khe từ của nam châm nhưng không chạm vào nam châm. Dòng điện tín hiệu sẽ chạy qua cuộn dây này.</li>
            <li><strong>Màng loa (Cone/Diaphragm):</strong> Gắn chặt với cuộn dây. Khi cuộn dây dao động, màng loa dao động theo để nén và giãn không khí, tạo ra sóng âm.</li>
            <li><strong>Các bộ phận phụ trợ:</strong>
                <ul>
                    <li><em>Nhện loa (Spider) và Gân loa (Surround):</em> Giữ cho cuộn dây nằm chính giữa khe từ và giúp hệ thống đàn hồi trở về vị trí cân bằng.</li>
                    <li><em>Nắp che bụi (Dust cap):</em> Chắn bụi bẩn rơi vào khe từ.</li>
                </ul>
            </li>
        </ul>
    </section>

    <section>
        <h2 style="color: #2980b9;">2. Nguyên lý hoạt động</h2>
        <p>Hoạt động của loa dựa trên <strong>tác dụng của từ trường lên dòng điện</strong> (Lực Lo-ren-xơ/Lực Ampère).</p>
        <ol>
            <li><strong>Tín hiệu vào:</strong> Dòng điện xoay chiều (tín hiệu âm thanh) từ ampli chạy qua cuộn dây (Voice coil).</li>
            <li><strong>Tương tác từ:</strong> Cuộn dây mang dòng điện nằm trong từ trường của nam châm vĩnh cửu sẽ chịu tác dụng của lực từ. Chiều của lực tuân theo <em>Quy tắc bàn tay trái</em>.
                <ul>
                    <li>Khi dòng điện đổi chiều, chiều của lực từ cũng thay đổi (hướng ra hoặc hướng vào), làm cuộn dây dao động dọc theo trục.</li>
                </ul>
            </li>
            <li><strong>Tạo ra âm thanh:</strong> Cuộn dây gắn liền với màng loa nên màng loa cũng dao động theo với cùng tần số của dòng điện. Màng loa nén và giãn lớp không khí tiếp xúc, tạo ra sóng dọc lan truyền ra môi trường.</li>
        </ol>
    </section>

    <section>
        <h2 style="color: #2980b9;">3. Các công thức quan trọng (Dùng cho thi THPT QG)</h2>
        
        <h3>a. Độ lớn lực từ (Lực đẩy/kéo màng loa)</h3>
        <p>Lực từ tác dụng lên cuộn dây khi có dòng điện chạy qua được xác định bởi công thức:</p>
        <div style="background-color: #f1f1f1; padding: 15px; border-left: 5px solid #27ae60; margin: 10px 0; overflow-x: auto; text-align: center;">
            $$ F = B \\cdot I \\cdot l $$
        </div>
        <p><em>Trong đó:</em></p>
        <ul style="list-style-type: square;">
            <li>\\( F \\) là lực từ tác dụng lên cuộn dây (N).</li>
            <li>\\( B \\) là cảm ứng từ của nam châm vĩnh cửu (T).</li>
            <li>\\( I \\) là cường độ dòng điện chạy qua cuộn dây (A).</li>
            <li>\\( l \\) là chiều dài tổng cộng của đoạn dây dẫn nằm trong từ trường (m).</li>
        </ul>
        <p>Khi cường độ dòng điện \\( I \\) thay đổi, lực từ \\( F \\) thay đổi làm màng loa dao động với biên độ thay đổi, từ đó quyết định độ to của âm thanh phát ra. Tần số của dòng điện đầu vào sẽ quyết định tần số dao động của màng loa, tạo ra âm thanh có cùng tần số.</p>

        <h3>b. Áp suất tác dụng lên màng loa (p)</h3>
        <p>Trong các bài tập nâng cao, áp suất cực đại tác dụng lên màng loa có diện tích <em>S</em> được tính bằng:</p>
        <div style="background-color: #f1f1f1; padding: 15px; border-left: 5px solid #27ae60; margin: 10px 0;">
            <strong>p = F / S</strong>
        </div>
        <p>Nếu màng loa hình tròn bán kính R, diện tích là S = &pi;R<sup>2</sup>.</p>

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
                <td>Sóng âm là sóng cơ học, cần môi trường vật chất để lan truyền.</td>
            </tr>
            <tr>
                <td>Khi tăng cường độ dòng điện, âm thanh phát ra nhỏ đi.</td>
                <td style="color: red; font-weight: bold;">SAI</td>
                <td>I tăng &rarr; F tăng &rarr; Biên độ dao động mạnh hơn &rarr; Âm to hơn.</td>
            </tr>
            <tr>
                <td>Loa hoạt động dựa trên hiện tượng cảm ứng điện từ.</td>
                <td style="color: orange; font-weight: bold;">Cần lưu ý</td>
                <td>Chính xác là dựa trên <strong>lực từ tác dụng lên dòng điện</strong>. Cảm ứng điện từ là nguyên lý của Micro (ngược lại với Loa).</td>
            </tr>
            <tr>
                <td>Sóng âm do loa tạo ra trong không khí là sóng dọc.</td>
                <td style="color: green; font-weight: bold;">ĐÚNG</td>
                <td>Do quá trình nén và giãn của khối không khí.</td>
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
               F<sub>max</sub> = B &cdot; I<sub>0</sub> &cdot; &ell; = 0,35 &cdot; 2 &cdot; 0,25 = <strong>0,175 (N)</strong>.
            </p>
            <p>3. Diện tích màng loa (S):<br>
               S = &pi; &cdot; R<sup>2</sup> = &pi; &cdot; (0,075)<sup>2</sup> &approx; 0,01767 (m<sup>2</sup>).
            </p>
            <p>4. Áp suất cực đại (p<sub>max</sub>):<br>
               p<sub>max</sub> = F<sub>max</sub> / S = 0,175 / 0,01767 &approx; <strong>9,9 (Pa)</strong>.
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
<strong>Tóm tắt dữ kiện đề bài:</strong>
    <ul>
        <li>Chiều dài dây dẫn: \\( l = 25 \\text{ cm} = 0,25 \\text{ m} \\).</li>
        <li>Cảm ứng từ: \\( B = 0,35 \\text{ T} \\).</li>
        <li>Đường kính màng loa: \\( D = 15 \\text{ cm} = 0,15 \\text{ m} \\).</li>
        <li>Phương trình dòng điện: \\( i = 2\\cos(100\\pi t) \\text{ (A)} \\).</li>
        <li>Suy ra cường độ dòng điện cực đại: \\( I_0 = 2 \\text{ A} \\).</li>
    </ul>

    <hr>

    <strong>Phân tích từng phát biểu:</strong>

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
            // Based Problem 1
            {
                question: `
<div>
    <strong> Quan sát mô hình loa điện động được mô tả như hình dưới. Xét tính đúng/sai các phát biểu sau</strong>
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
                reference: 'Câu 2 Đề thi thử tốt nghiệp 2025 (Mã đề 1201)',
                solution: `
<p><strong>a) Sai.</strong> Khi cho dòng điện không đổi (DC) vào hai điểm nối tín hiệu, cuộn dây sẽ sinh ra một từ trường không đổi, dẫn đến lực từ tác dụng lên cuộn dây cũng không đổi. Lực này chỉ làm màng loa dịch chuyển đến một vị trí cố định mới rồi dừng lại chứ không tạo ra dao động liên tục. Vì vậy, loa sẽ không thể phát ra âm thanh.</p>

<p><strong>b) Sai.</strong> Sóng âm thanh phát ra từ loa là sóng cơ học, được tạo ra từ sự dao động của các phần tử vật chất trong môi trường (như nén và giãn không khí). Sóng âm chỉ truyền được trong các môi trường rắn, lỏng, khí và hoàn toàn không thể truyền được trong chân không.</p>

<p><strong>c) Sai.</strong> Theo cấu tạo của loa điện động, bộ phận nam châm vĩnh cửu được đặt cố định, không di chuyển. Khi có dòng điện xoay chiều chạy qua, chính cuộn dây (được gắn cứng với màng loa) mới là bộ phận chịu tác dụng của lực từ biến thiên và dao động, từ đó kéo theo màng loa dao động để phát ra âm thanh.</p>

<p><strong>d) Sai.</strong> Tần số của sóng âm do loa phát ra luôn bằng với tần số của dòng điện (tín hiệu điện) truyền vào cuộn dây. Dựa vào thông số được cung cấp trực tiếp từ đồ thị, tần số của điện áp đầu vào là $f = \\frac{40000}{3} \\text{ Hz}$ (chứ không phải $\\frac{4000}{3} \\text{ Hz}$). Do đó, tần số âm loa phát ra cũng là $\\frac{40000}{3} \\text{ Hz}$, phát biểu đã cho sai giá trị.</p>
        `
            },
            // Based Problem 2
            {
                question: `<p><strong>Loa điện động</strong> hoạt động dựa trên tác dụng từ giữa nam châm vĩnh cửu và cuộn dây dẫn. Cấu tạo chính gồm một <strong>cuộn dây nhẹ</strong> gắn chặt với <strong>màng loa</strong>, được đặt trong khe hở từ của nam châm vĩnh cửu, nơi có các đường sức từ hướng xuyên tâm.</p>

                <p>Xét một mẫu loa có ống dây gồm:</p>

                <p>\\[
                N = 100\\ \\text{vòng}
                \\]</p>

                <p>Các vòng dây quấn sít nhau tạo thành ống dây có chiều dài:</p>

                <p>\\[
                L = 2\\,\\text{cm}
                \\]</p>

                <p>Hãy cho biết các phát biểu sau đây là đúng hay sai.</p>

                <p><strong>a)</strong> Khi có dòng điện xoay chiều đi qua, cuộn dây đóng vai trò như một nam châm điện, tương tác với nam châm vĩnh cửu và khiến cho màng loa dao động để tạo ra âm thanh.</p>

                <p><strong>b)</strong> Nguyên lí hoạt động của loa điện động là hiện tượng cảm ứng điện từ.</p>

                <p><strong>c)</strong> Để loa hoạt động ổn định và phát ra âm thanh liên tục, ta có thể nối hai đầu cuộn dây với nguồn điện một chiều có cường độ dòng điện không đổi.</p>

                <p><strong>d)</strong> Biết độ lớn cảm ứng từ trong cuộn dây được tính bằng công thức:</p>

                <p>\\[
                B = 4\\pi\\cdot10^{-7}\\cdot n\\cdot I
                \\]</p>

                <p>Giả sử dòng điện trong cuộn dây tại một thời điểm có cường độ:</p>

                <p>\\[
                I = 2\\,\\text{A}
                \\]</p>

                <p>Khi đó cảm ứng từ do chính cuộn dây sinh ra trong lòng nó có độ lớn khoảng:</p>

                <p>\\[
                B \\approx 12,6\\,\\text{mT}
                \\]</p>`,
                options: [],
                correct_answer: "",
                level: 'MEDIUM',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đề Sở GD Hà Tĩnh 2025',
                solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`

            },
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
                solution: `
<p><strong>a) Sai.</strong> Loa điện động hoạt động dựa trên tác dụng của lực từ lên đoạn dây dẫn mang dòng điện đặt trong từ trường (được gọi là lực từ hay lực Ampere), không phải dựa trên hiện tượng cảm ứng điện từ. Hiện tượng cảm ứng điện từ là nguyên lí hoạt động của micro điện động hoặc máy phát điện.</p>

<p><strong>b) Đúng.</strong> Căn cứ vào nguyên lí hoạt động, khi tín hiệu điện biến thiên với một tần số xác định truyền vào cuộn dây, lực từ tác dụng lên cuộn dây cũng biến thiên cùng tần số đó, làm màng loa dao động và tạo ra sóng âm thanh trong không khí có cùng tần số với dao động điện đầu vào.</p>

<p><strong>c) Đúng.</strong> Khi sóng âm truyền trong chất khí (như không khí), các phần tử của môi trường dao động dọc theo phương truyền sóng. Do đó, sóng âm trong không khí luôn luôn là sóng dọc.</p>

<p><strong>d) Đúng.</strong> Ta có thể kiểm tra độ lớn của lực từ bằng các bước sau: <br>
- Cường độ dòng điện chạy qua cuộn dây: $I = \\frac{U}{R} = \\frac{12}{5,8} \\approx 2,07 \\text{ A}$. <br>
- Tổng chiều dài của 20 vòng dây (với chu vi mỗi vòng là $\\pi d$): $L = N \\cdot \\pi d = 20 \\cdot \\pi \\cdot 0,072 \\approx 4,52 \\text{ m}$. <br>
- Độ lớn lực từ tác dụng lên cuộn dây (vì từ trường vuông góc với dòng điện): $F = B \\cdot I \\cdot L = 0,075 \\cdot 2,07 \\cdot 4,52 \\approx 0,70 \\text{ N}$.</p>
        `
            },
            {
                question: `<p><strong>Câu 5 (ID: 763740)</strong></p>

<p>Một loa điện động có một cuộn dây nằm trong khe hở của một nam châm. Giả sử từ trường của nam châm có độ lớn cảm ứng từ:</p>

<p>\\[
B = 0,1\\,\\text{T}
\\]</p>

<p>Cuộn dây có đường kính:</p>

<p>\\[
d = 6\\,\\text{cm}
\\]</p>

<p>Điện trở của cuộn dây:</p>

<p>\\[
R = 6,0\\,\\Omega
\\]</p>

<p>Gồm:</p>

<p>\\[
N = 20
\\]</p>

<p>vòng dây.</p>

<p>Khi kết nối với nguồn có hiệu điện thế:</p>

<p>\\[
U = 12\\,\\text{V}
\\]</p>

<p>Dòng điện chạy trong cuộn dây tại một thời điểm xác định có chiều cùng chiều kim đồng hồ như hình bên.</p>

<p>Hãy xác định độ lớn lực từ tác dụng lên cuộn dây tại thời điểm đó.</p>

<p><em>(Làm tròn kết quả đến chữ số hàng phần trăm.)</em></p>

<div style="margin-top:12px;padding:12px;border-left:4px solid #007bff;background:#f1f8ff;">
<strong>Dữ kiện:</strong>
<ul>
<li>$B = 0,1\\,\\text{T}$</li>
<li>$d = 6\\,\\text{cm}$</li>
<li>$R = 6,0\\,\\Omega$</li>
<li>$N = 20$ vòng</li>
<li>$U = 12\\,\\text{V}$</li>
</ul>
</div>`,
                options: [],
                correct_answer: "",
                level: 'MEDIUM',
                type: 'Essay',
                reference: 'Khảo sát chất lượng học sinh lớp 12 (lần 1) năm học 2024–2025 - Môn Vật lí, 2025, Sở GD&ĐT Thanh Hóa',
                solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`
            },
            {
                question: `<p><strong>Câu 4.</strong> Chọn câu ĐÚNG/SAI: Micro điện động là thiết bị được sử dụng để chuyển dao động âm thanh thành dòng điện biến đổi dựa trên hiện tượng cảm ứng điện từ, nhờ đó có thể khuếch đại âm thanh của người hát ra loa điện động.</p>

<p>Về nguyên lý hoạt động, khi một người hát trước micro, màng rung bên trong micro được gắn với ống dây sẽ dao động làm ống dây di chuyển qua lại trong từ trường của một thanh nam châm vĩnh cửu, trục của ống dây trùng với trục của nam châm. Khi đó trong ống dây xuất hiện dòng điện cảm ứng, dòng điện này sẽ được dẫn ra mạch khuếch đại rồi ra loa.</p>

  <div style="margin-top:12px;padding:10px;background:#f1f8ff;border-left:4px solid #007bff;">
    <strong>Dữ kiện:</strong>
    <ul style="margin:5px 0;padding-left:20px;">
      <li>Số vòng dây: $N = 20$</li>
      <li>Tiết diện vòng dây: $S = 30\\,\\text{cm}^2$</li>
      <li>Tốc độ biến thiên cảm ứng từ cực đại:
      $\\left|\\dfrac{dB}{dt}\\right|_{\\max}=7,0\\,\\text{T/s}$</li>
    </ul>
  </div>
</div>

<p>Giả sử rằng ống dây có:</p>

<p>\\[
N = 20
\\]</p>

<p>vòng dây và tiết diện vòng dây:</p>

<p>\\[
S = 30\\,\\text{cm}^2
\\]</p>

<p>Khi người hát phát ra một đơn âm khiến cuộn dây di chuyển đi vào và đi ra khỏi nam châm làm tốc độ biến thiên cảm ứng từ qua ống dây có giá trị cực đại:</p>

<p>\\[
\\left|\\frac{dB}{dt}\\right|_{\\max}=7,0\\,\\text{T/s}
\\]</p>

<p><strong>a)</strong> Tần số dao động điện trong micro bằng tần số âm thanh tạo ra.</p>

<p><strong>b)</strong> Qua khuếch đại, biên độ dao động điện giảm xuống đáng kể, trong khi đó tần số được tăng lên.</p>

<p><strong>c)</strong> Dòng điện cảm ứng xuất hiện trong ống dây của micro là dòng điện được cấp bởi nguồn điện bên ngoài, thường là pin.</p>

<p><strong>d)</strong> Độ lớn suất điện động cực đại xuất hiện trong ống dây là:</p>

<p>\\[
0,42\\,\\text{V}
\\]</p>`,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                reference: 'Kỳ thi thử tốt nghiệp THPT năm 2025-2026 - Môn Vật lí, 2026, Sở GD&ĐT Thanh Hóa',
                solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`
            },
            {
                question: `Loa điện là gì? Hãy kể tên các loại loa điện khác nhau.</p>`,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                reference: 'Class XII Electronics Technology (344), 2025, Central Board of Secondary Education; Section A, Câu 17',
                solution: `<p>Loa điện là một thiết bị điện - âm học dùng để chuyển đổi tín hiệu điện thành sóng âm thanh.</p>

                <p>Một số loại loa điện phổ biến gồm:</p>

                <ul>
                <li>Loa điện động (Moving-coil loudspeaker)</li>
                <li>Loa kèn (Horn loudspeaker)</li>
                <li>Loa áp điện (Piezoelectric loudspeaker)</li>
                <li>Loa tĩnh điện (Electrostatic loudspeaker)</li>
                <li>Loa từ phẳng (Planar magnetic loudspeaker)</li>
                <li>Loa trầm (Woofer)</li>
                <li>Loa trung (Mid-range speaker)</li>
                <li>Loa tép / loa cao tần (Tweeter)</li>
                <li>Loa siêu trầm (Subwoofer)</li>
                </ul>`
            },
            {
                question: `<p><strong>Câu 22.</strong> Các vùng nén và vùng giãn được phát ra từ màng loa khi màng loa dao động qua lại. Tần số dao động là:</p>

<p>\\[
f = 50\\,\\text{Hz}
\\]</p>

<p>Tại điểm $P$ đang có một vùng nén. Hỏi sau bao lâu thì vùng giãn tiếp theo đến điểm $P$?</p>

<p><strong>A.</strong> $0,010\\,\\text{s}$</p>
<p><strong>B.</strong> $0,020\\,\\text{s}$</p>
<p><strong>C.</strong> $25\\,\\text{s}$</p>
<p><strong>D.</strong> $50\\,\\text{s}$</p>
`,
                options: [{ id: "A", text: "A" }, { id: "B", text: "B" }, { id: "C", text: "C" }, { id: "D", text: "D" }],
                correct_answer: "A",
                level: 'HARD',
                type: 'Essay',
                reference: 'Physics 5054/11 Paper 1 Multiple Choice, 2014, Cambridge International Examinations/UCLES; Câu 22, tr. 10.',
                solution: `<p>Chu kỳ dao động của sóng âm là:</p>

<p>\\[
T = \\frac{1}{f} = \\frac{1}{50} = 0,020\\,\\text{s}
\\]</p>

<p>Một vùng nén và vùng giãn liên tiếp cách nhau nửa chu kỳ:</p>

<p>\\[
t = \\frac{T}{2} = \\frac{0,020}{2} = 0,010\\,\\text{s}
\\]</p>

<p>Vậy thời gian để vùng giãn tiếp theo đến điểm $P$ là:</p>

<p>\\[
0,010\\,\\text{s}
\\]</p>

<p><strong>Đáp án đúng: A.</strong></p>`
            },
            {
                question: `<p><strong>Câu 1.</strong> Hai loa $S_1$ và $S_2$ được nối với một máy phát tín hiệu. Hai loa phát ra các sóng âm kết hợp.</p>

<p><strong>(a)</strong> Hãy nêu ý nghĩa của thuật ngữ <strong>kết hợp</strong>.</p>

<p>....................................................................................................................</p>
<p>.................................................................................................................... [1]</p>

<p><strong>(b)</strong> Một micro được nối với dao động ký. Các điểm $O$, $J$, $K$ và $L$ cùng nằm trên một đường thẳng như hình vẽ. Micro được di chuyển từ $O$ đến $L$.</p>

<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 20px auto; padding: 16px; background: #fff;">
  <svg width="100%" height="380" viewBox="0 0 520 380">
    <line x1="280" y1="40" x2="280" y2="310" stroke="black" stroke-width="2"/>

    <circle cx="280" cy="60" r="4" fill="black"/>
    <text x="292" y="66" font-size="20">L</text>

    <circle cx="280" cy="160" r="4" fill="black"/>
    <text x="292" y="166" font-size="20">K</text>

    <circle cx="280" cy="205" r="4" fill="black"/>
    <text x="292" y="211" font-size="20">J</text>

    <circle cx="280" cy="250" r="4" fill="black"/>
    <text x="292" y="256" font-size="20">O</text>

    <circle cx="120" cy="220" r="4" fill="black"/>
    <text x="88" y="226" font-size="20" font-weight="bold">S₁</text>

    <circle cx="120" cy="280" r="4" fill="black"/>
    <text x="88" y="286" font-size="20" font-weight="bold">S₂</text>

    <line x1="120" y1="250" x2="280" y2="250" stroke="gray" stroke-width="2" stroke-dasharray="7,7"/>

    <text x="105" y="350" font-size="18" font-weight="bold">Không theo tỉ lệ</text>
  </svg>
</div>

<p>Một loạt cực đại và cực tiểu được quan sát giữa $O$ và $L$.</p>

<p>Micro ghi nhận một cực đại tại $O$. Khi micro di chuyển về phía $L$, cực tiểu đầu tiên được quan sát tại $J$ và cực đại tiếp theo tại $K$.</p>

<p>Khoảng cách giữa $S_1$ và $J$ là $2,00\\,\\text{m}$, khoảng cách giữa $S_2$ và $J$ là $2,08\\,\\text{m}$.</p>

<p>Khoảng cách giữa $S_1$ và $K$ là $2,05\\,\\text{m}$, khoảng cách giữa $S_2$ và $K$ là $2,21\\,\\text{m}$.</p>

<p><strong>(i)</strong> Tính độ lệch đường đi tại điểm $J$ giữa các sóng từ $S_1$ và $S_2$.</p>

<p>Độ lệch đường đi = .................................................. m [1]</p>

<p><strong>(ii)</strong> Nêu độ lệch pha theo radian tại điểm $J$ giữa các sóng từ $S_1$ và $S_2$.</p>

<p>Độ lệch pha = .................................................. rad [1]</p>

<p><strong>(iii)</strong> Chứng minh rằng bước sóng của sóng âm là $0,16\\,\\text{m}$.</p>

<p>.................................................................................................................... [1]</p>

<p><strong>(c)</strong> Tần số của âm được xác định bằng dao động ký.</p>

<p><strong>(i)</strong> Giải thích cách sử dụng dao động ký để xác định tần số.</p>

<p>....................................................................................................................</p>
<p>....................................................................................................................</p>
<p>.................................................................................................................... [2]</p>

<p><strong>(ii)</strong> Tần số của âm là $2,1\\,\\text{kHz}$.</p>

<p>Xác định tốc độ $v$ của âm.</p>

<p>$v =$ .................................................. $\\text{m s}^{-1}$ [2]</p>`,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                reference: 'AS Level Physics A - H156/02 Depth in Physics, 2021, OCR; Question 1, tr. 2-3/20',
                solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`
            },
            {
                question: `<p><strong>Câu 17.</strong> Hình vẽ cho thấy hai loa giống hệt nhau $X$ và $Y$ được nối với một máy phát tín hiệu. Hai loa phát ra sóng âm có cùng biên độ, cùng tần số và cùng pha.</p>

<p>Một micro $M$ được di chuyển dọc theo đường thẳng từ $P_1$ đến $P_3$, và tín hiệu được ghi lại trên dao động ký.</p>

<p><strong>Không theo tỉ lệ</strong></p>

<div style="font-family: Arial, sans-serif; max-width: 760px; margin: 20px auto; padding: 16px; background: #fff;">
  <svg width="100%" height="360" viewBox="0 0 800 360">
    <rect x="40" y="120" width="120" height="90" fill="none" stroke="black" stroke-width="2"/>
    <text x="55" y="155" font-size="18">Máy phát</text>
    <text x="55" y="180" font-size="18">tín hiệu</text>

    <line x1="160" y1="150" x2="210" y2="150" stroke="black" stroke-width="2"/>
    <line x1="210" y1="150" x2="210" y2="80" stroke="black" stroke-width="2"/>
    <line x1="210" y1="80" x2="260" y2="80" stroke="black" stroke-width="2"/>

    <line x1="160" y1="190" x2="210" y2="190" stroke="black" stroke-width="2"/>
    <line x1="210" y1="190" x2="210" y2="250" stroke="black" stroke-width="2"/>
    <line x1="210" y1="250" x2="260" y2="250" stroke="black" stroke-width="2"/>

    <rect x="260" y="70" width="25" height="20" fill="white" stroke="black" stroke-width="2"/>
    <polygon points="285,70 315,58 315,102 285,90" fill="white" stroke="black" stroke-width="2"/>
    <text x="275" y="50" font-size="22">X</text>

    <rect x="260" y="240" width="25" height="20" fill="white" stroke="black" stroke-width="2"/>
    <polygon points="285,240 315,228 315,272 285,260" fill="white" stroke="black" stroke-width="2"/>
    <text x="275" y="230" font-size="22">Y</text>

    <line x1="610" y1="40" x2="610" y2="260" stroke="black" stroke-width="2" stroke-dasharray="10,10"/>

    <circle cx="610" cy="40" r="4" fill="black"/>
    <text x="580" y="45" font-size="22">P₃</text>

    <circle cx="610" cy="135" r="4" fill="black"/>
    <text x="580" y="140" font-size="22">P₂</text>

    <circle cx="610" cy="230" r="4" fill="black"/>
    <text x="580" y="235" font-size="22">P₁</text>

    <circle cx="630" cy="220" r="10" fill="white" stroke="black" stroke-width="2"/>
    <text x="625" y="205" font-size="22">M</text>

    <line x1="315" y1="125" x2="610" y2="125" stroke="black" stroke-width="1.5"/>
    <polygon points="315,125 325,120 325,130" fill="black"/>
    <polygon points="610,125 600,120 600,130" fill="black"/>
    <text x="455" y="115" font-size="22">$D$</text>

    <line x1="640" y1="220" x2="710" y2="220" stroke="black" stroke-width="2"/>
    <line x1="640" y1="230" x2="710" y2="230" stroke="black" stroke-width="2"/>

    <rect x="710" y="180" width="70" height="70" fill="white" stroke="black" stroke-width="2"/>
    <path d="M720 215 C730 185 740 245 750 215 C760 185 770 245 780 215" fill="none" stroke="black" stroke-width="1.5"/>
    <text x="690" y="165" font-size="18">Dao động ký</text>
  </svg>
</div>

<p>Khi micro được di chuyển dọc theo đường từ $P_1$ đến $P_3$, dao động ký cho thấy tín hiệu cực đại tại $P_1$, tín hiệu bằng không tại $P_2$ và tín hiệu cực đại tiếp theo tại $P_3$.</p>

<p><strong>(a)</strong> Giải thích các quan sát trên.</p>

<p>....................................................................................................................</p>
<p>....................................................................................................................</p>
<p>....................................................................................................................</p>
<p>.................................................................................................................... [2]</p>

<p><strong>(b)</strong> Khoảng cách giữa tâm của $X$ và $Y$ là $70,0\\,\\text{cm}$, khoảng cách $D$ như hình vẽ là $4,00\\,\\text{m}$ và khoảng cách từ $P_1$ đến $P_2$ là $1,25\\,\\text{m}$.</p>

<p>Sử dụng công thức giao thoa hai nguồn để tính tần số của sóng âm.</p>

<p>Cho tốc độ âm:</p>

<p>\\[
v = 340\\,\\text{m s}^{-1}
\\]</p>

<p><strong>(c)</strong> Loa $Y$ bây giờ được thay bằng một loa tạo ra sóng âm có biên độ gấp đôi biên độ ban đầu.</p>

<p>Mô tả sự thay đổi của tín hiệu quan sát được trên dao động ký khi micro được di chuyển dọc theo đường từ $P_1$ đến $P_3$.</p>

<p>....................................................................................................................</p>
<p>....................................................................................................................</p>
<p>....................................................................................................................</p>
<p>.................................................................................................................... [2]</p>`,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                reference: 'A Level Physics A - H556/02 Exploring Physics, 2024, OCR; mục (b)-(c), quanh tr. 14-15/32',
                solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`
            }

        ]
    );

    // 3. MASS SPECTROMETER (Máy quang phổ khối)
    await createModelContent(
        {
            model_type_name: 'MASS_SPECTROMETER',
            name: 'Máy quang phổ khối',
            description: 'Mô hình 3D Máy quang phổ khối',
            source_url: '',
            thumbnail_url: '/mayQuangphokhoi.png',
            status: 'ACTIVE'
        },
        [{
            title: 'Lý thuyết mô hình Máy quang phổ khối',
            content_html: `
<div class="spectrometer-theory" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto;">
    <h1 style="text-align: center; color: #8e44ad; border-bottom: 2px solid #8e44ad; padding-bottom: 10px;">CHUYÊN ĐỀ: MÁY QUANG PHỔ KHỐI (MASS SPECTROMETER)</h1>

    <section>
        <h2 style="color: #2980b9;">1. Định nghĩa và Chức năng</h2>
        <p><strong>Định nghĩa:</strong> Máy quang phổ khối (khối phổ kế) là một thiết bị dùng để tách các ion (hạt mang điện) có khối lượng khác nhau dựa trên sự lệch hướng của chúng trong từ trường.</p>
        <p><strong>Chức năng chính:</strong></p>
        <ul>
            <li>Đo khối lượng của các hạt cơ bản (electron, proton...) hoặc các ion nguyên tử/phân tử.</li>
            <li>Xác định thành phần đồng vị của một nguyên tố hóa học.</li>
            <li>Phân tích cấu trúc phân tử trong hóa học và sinh học.</li>
        </ul>
    </section>

    <section>
        <h2 style="color: #2980b9;">2. Cấu tạo và Nguyên lý hoạt động</h2>
        <p>Quá trình hoạt động gồm các giai đoạn chính:</p>
        <ul>
            <li>
                <strong>1. Buồng ion hoá:</strong> Biến các nguyên tử/phân tử của mẫu chất thành ion mang điện tích \\( q \\).
            </li>
            <li>
                <strong>2. Buồng gia tốc:</strong> Dưới tác dụng của một hiệu điện thế mạnh \\( U \\), các ion được gia tốc. Theo định lý biến thiên động năng (bỏ qua vận tốc đầu), ta có:
                <div style="background-color: #f1f1f1; padding: 10px; border-left: 5px solid #8e44ad; overflow-x: auto; text-align: center; margin: 10px 0;">
                    $$ \\Delta W_d = \\frac{1}{2}mv^2 = |q|U \\Rightarrow v = \\sqrt{\\frac{2 \\cdot |q| \\cdot U}{m}} $$
                </div>
            </li>
            <li>
                <strong>3. Buồng phân tích (vùng từ trường):</strong> Ion đi vào từ trường đều \\( \\vec{B} \\) theo phương vuông góc với các đường sức từ. Lực từ (lực Lorentz) có độ lớn \\( F = |q|vB \\) đóng vai trò là lực hướng tâm làm ion chuyển động theo quỹ đạo tròn:
                <div style="background-color: #f1f1f1; padding: 10px; border-left: 5px solid #8e44ad; overflow-x: auto; text-align: center; margin: 10px 0;">
                    $$ F_{ht} = F_{Lorentz} \\Rightarrow \\frac{m \\cdot v^2}{r} = |q| \\cdot v \\cdot B \\Rightarrow r = \\frac{m \\cdot v}{|q| \\cdot B} $$
                </div>
            </li>
        </ul>
        <p>Do bán kính quỹ đạo \\( r \\) phụ thuộc vào tỉ số \\( \\frac{m}{|q|} \\), các ion nặng nhẹ khác nhau sẽ bị lệch theo các đường cong khác nhau và rơi vào những vị trí khác biệt trên bản phim máy dò.</p>
    </section>

    <section>
        <h2 style="color: #2980b9;">3. Ứng dụng: Tách đồng vị</h2>
        <p>Ví dụ: Tách đồng vị Neon (<sup>20</sup>Ne và <sup>22</sup>Ne).</p>
        <ul>
            <li>Hai đồng vị có cùng điện tích q, cùng được tăng tốc bởi U &rArr; cùng năng lượng.</li>
            <li>Do khối lượng khác nhau (m<sub>22</sub> > m<sub>20</sub>) nên bán kính quỹ đạo khác nhau (R<sub>22</sub> > R<sub>20</sub>).</li>
            <li>Chúng sẽ đập vào tấm phim tại hai vạch riêng biệt. Khoảng cách giữa hai vạch giúp tính toán chính xác khối lượng hoặc xác định tỉ lệ phần trăm đồng vị.</li>
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

        [{
            title: 'Bài toán Máy quang phổ khối',
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
            // Base Problem
            {
                question: `<p><strong>Câu 2.</strong> Để xác định các chất trong một mẫu, người ta dùng một máy được gọi là <strong>máy quang phổ khối</strong> hay khối phổ kế. Khi cho mẫu vào máy này, hạt có khối lượng $m$ bị ion hóa sẽ mang điện tích $q$. Sau đó, hạt được tăng tốc đến tốc độ $v$ nhờ hiệu điện thế $U$. Tiếp theo, hạt sẽ chuyển động vào vùng từ trường theo phương vuông góc với cảm ứng từ $\\vec{B}$.</p>

<p>Lực từ tác dụng lên hạt có độ lớn $F = Bv|q|$, có phương vuông góc với cảm ứng từ $\\vec{B}$ và với vận tốc $\\vec{v}$ của hạt. Bán kính quỹ đạo tròn của hạt trong vùng có từ trường là $r$. Dựa trên tỉ số $\\dfrac{|q|}{m}$, có thể xác định được các chất trong mẫu.</p>

<p><strong>a)</strong> Tốc độ của hạt bị thay đổi do tác dụng của từ trường trong máy.</p>

<p><strong>b)</strong> Bỏ qua tốc độ ban đầu của hạt. Sau khi được tăng tốc bởi hiệu điện thế $U$, tốc độ của hạt là:</p>

<p>\\[
v = \\sqrt{\\dfrac{2|q|U}{m}}
\\]</p>

<p><strong>c)</strong> Tỉ số giữa độ lớn điện tích và khối lượng của hạt là:</p>

<p>\\[
\\dfrac{|q|}{m} = \\dfrac{2U}{B^2r^2}
\\]</p>

<p><strong>d)</strong> Biết $U = 3,00\\,\\text{kV}$; $B = 3,00\\,\\text{T}$; $1\\,\\text{amu} = 1,66\\cdot10^{-27}\\,\\text{kg}$; $|e| = 1,60\\cdot10^{-19}\\,\\text{C}$. Bán kính quỹ đạo của ion âm $^{35}\\text{Cl}^{-}$ trong vùng có từ trường là $r = 0,0156\\,\\text{m}$.</p>`,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                status: 'ACTIVE',
                reference: 'Đề minh họa THPT 2025 của Bộ Giáo dục',
                solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`

            },
            // PROBLEM 1
            {
                question: `
<div>
    <p>Các ion dương thoát ra khỏi nguồn ion qua khe\\( S_1 \\) có cùng vận tốc đầu\\( \\vec{v_0} \\) theo phương\\( x \\) được dẫn vào chính giữa hai bản tụ điện phẳng có chiều dài\\( l=5 \\text{cm} \\). Hai bản tụ điện cách nhau\\( d=2 \\text{cms} \\) và có hiệu điện thế\\( U=100 \\text{V} \\). Sau khi ra khỏi tụ điện, các ion đi vào trong một vùng từ trường có\\( \\vec{B} \\) vuông góc với mặt phẳng hình vẽ. Trong vùng từ trường có đặt hai tấm phim đặc biệt\\( P_1, P_2 \\) vuông góc với chùm ion đi ra khỏi tụ điện (Hình).
        <br>
        Biết:\\( v_0= 10^5 \\text{m/s} \\);\\( B=0,5 \\text{mT} \\).\\( O_2 \\) cách bản tụ dưới\\( h=1,5 \\text{cm} \\).
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
                solution:
                    `
<p><em>Lưu ý: Mặc định điện tích của các ion dương là điện tích nguyên tố $q = 1,6 \\cdot 10^{-19} \\text{ C}$. </p>

<p><strong>a) Đúng.</strong> Khi ion dương bay vào chính giữa hai bản tụ điện phẳng với vận tốc $\\vec{v_0}$ vuông góc với các đường sức điện (hướng từ bản dương sang bản âm), ion sẽ chịu tác dụng của lực điện $\\vec{F} = q\\vec{E}$ có phương vuông góc với $\\vec{v_0}$. Quỹ đạo chuyển động của ion trong tụ điện hoàn toàn tương tự như quỹ đạo của một vật ném ngang trong trường trọng lực.</p>

<p><strong>b) Sai.</strong> Ta tính góc lệch $\\alpha$ của véctơ vận tốc so với phương ngang khi ion ra khỏi tụ: <br>
- Thời gian ion chuyển động trong tụ: $t = \\frac{l}{v_0} = \\frac{0,05}{10^5} = 5 \\cdot 10^{-7} \\text{ s}$. <br>
- Vận tốc theo phương $y$ khi ra khỏi tụ: $v_y = a t = \\frac{qU}{m_1 d} \\cdot t = \\frac{1,6 \\cdot 10^{-19} \\cdot 100}{10^{-23} \\cdot 0,02} \\cdot 5 \\cdot 10^{-7} = 40 \\text{ m/s}$. <br>
- Góc lệch $\\alpha$ được xác định bởi: $\\tan \\alpha = \\frac{v_y}{v_0} = \\frac{40}{10^5} = 4 \\cdot 10^{-4}$. <br>
Với $\\tan \\alpha$ rất nhỏ, góc $\\alpha \\approx 0,023^\\circ$, hoàn toàn không thể bằng $60^\\circ$.</p>

<p><strong>c) Sai.</strong> Sau khi ra khỏi điện trường, vận tốc của hạt là $v_1 = \\sqrt{v_0^2 + v_y^2} \\approx 10^5 \\text{ m/s}$. <br>
Khi vào từ trường, lực Lo-ren-xơ đóng vai trò lực hướng tâm. Bán kính quỹ đạo của ion $m_1$ là: <br>
$R_1 = \\frac{m_1 v_1}{qB} = \\frac{10^{-23} \\cdot 10^5}{1,6 \\cdot 10^{-19} \\cdot 0,5 \\cdot 10^{-3}} = 12500 \\text{ m}$. <br>
Giá trị này là rất khổng lồ và khác hoàn toàn so với $28,3 \\text{ cm}$. <em>(Có thể dữ kiện đề bài gốc có sự sai sót về bậc độ lớn của khối lượng $m_1$ hoặc giá trị cảm ứng từ $B$).</em></p>

<p><strong>d) Sai.</strong> Dựa trên các thông số đã cho làm phát sinh một bán kính quỹ đạo $R_1, R_2$ khổng lồ (lên tới hàng kilomet), quỹ đạo của ion gần như là một đường thẳng tuyến tính trong phạm vi của phòng thí nghiệm. Việc tính toán vị trí chạm vào các tấm phim để ra được con số nhỏ như $6,4 \\text{ cm}$ với các dữ kiện hiện tại là vô lý về mặt vật lý lẫn toán học.</p>
        `
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
                solution:
                    `
<p><strong>a) Đúng.</strong> Vùng có điện trường và từ trường kết hợp đóng vai trò là "bộ chọn vận tốc". Để ion đi thẳng không bị lệch quỹ đạo, lực điện trường và lực từ (lực Lo-ren-xơ) tác dụng lên ion phải ngược chiều và có độ lớn bằng nhau (cân bằng nhau): $F_d = F_t \\Rightarrow |q|E = |q|vB$.</p>

<p><strong>b) Đúng.</strong> Từ điều kiện cân bằng ở câu a, ta có cường độ điện trường $E = vB$. <br>
Hiệu điện thế giữa hai bản tụ phẳng là: $U = E \\cdot d = v \\cdot B \\cdot d$. <br>
Thay số: $U = 1,6 \\cdot 10^5 \\cdot 0,4 \\cdot 5 \\cdot 10^{-3} = 320 \\text{ V}$.</p>

<p><strong>c) Sai.</strong> Khi ion đi vào vùng chỉ có từ trường $B'$ (giả thiết bài toán không cho $B'$ khác $B$ nên lấy $B' = B = 0,4 \\text{ T}$ theo cấu tạo chuẩn của một số máy quang phổ khối đơn giản, hoặc dù $B'$ có giá trị khác thì với dữ kiện hiện tại không thể khẳng định con số $6,4 \\cdot 10^{-27} \\text{ kg}$), lực từ đóng vai trò là lực hướng tâm: <br>
$|q|vB' = \\frac{mv^2}{r} \\Rightarrow m = \\frac{|q|B'r}{v}$. <br>
Tính khối lượng với $B' = 0,4 \\text{ T}$: <br>
$m = \\frac{1,6 \\cdot 10^{-19} \\cdot 0,4 \\cdot 0,2}{1,6 \\cdot 10^5} = 8 \\cdot 10^{-26} \\text{ kg}$. <br>
Giá trị này khác hoàn toàn so với $6,4 \\cdot 10^{-27} \\text{ kg}$, do đó phát biểu này là sai.</p>

<p><strong>d) Đúng.</strong> Trong buồng phân tích của máy quang phổ khối, ion chuyển động theo quỹ đạo là một nửa đường tròn rồi đập vào tấm phim ảnh. Khoảng cách từ khe vào (điểm bắt đầu của nửa đường tròn) đến vết của ion trên tấm phim chính là đường kính của quỹ đạo: <br>
$D = 2r = 2 \\cdot 20 \\text{ cm} = 40 \\text{ cm}$.</p>
        `
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
                solution:
                    `
<p><strong>a) Đúng.</strong> Trong buồng gia tốc, điện trường sinh công dương $A = qU$ để tăng tốc các ion. Theo định lý biến thiên động năng, công này làm tăng động năng của ion.</p>

<p><strong>b) Đúng.</strong> Áp dụng định lý biến thiên động năng cho ion trong buồng gia tốc: <br> $W_{d,sau} - W_{d,trước} = A \\Rightarrow \\frac{1}{2}mv^2 - \\frac{1}{2}mv_0^2 = qU$. <br> Suy ra: $v^2 = v_0^2 + \\frac{2qU}{m} \\Rightarrow v = \\sqrt{v_0^2 + \\frac{2qU}{m}}$.</p>

<p><strong>c) Đúng.</strong> Trong buồng hãm vận tốc (đóng vai trò là bộ chọn vận tốc), để ion chuyển động thẳng đều thì lực điện và lực từ (lực Lo-ren-xơ) phải cân bằng nhau về độ lớn và ngược chiều: <br> $F_d = F_t \\Rightarrow qE = qvB \\Rightarrow B = \\frac{E}{v}$. <br> Thay biểu thức vận tốc $v$ ở câu b vào, ta được: $B = \\frac{E}{\\sqrt{v_0^2 + \\frac{2qU}{m}}}$.</p>

<p><strong>d) Sai.</strong> Khi ion đi vào buồng phân tách có từ trường $B'$, lực từ đóng vai trò là lực hướng tâm, ta có: <br> $qvB' = m\\frac{v^2}{R} \\Rightarrow R = \\frac{mv}{qB'}$. <br> Từ điều kiện chuyển động thẳng trong buồng hãm vận tốc, ta có $v = \\frac{E}{B}$. Thay vào biểu thức bán kính, ta được: <br> $R = \\frac{m}{qB'} \\cdot \\frac{E}{B} = \\frac{mE}{qBB'}$. <br> Do đó, biểu thức $R = \\frac{1}{B'} \\sqrt{\\frac{mE}{qB}}$ là không chính xác.</p>
        `
            },
            {
                question: `Chọn đáp án ĐÚNG/SAI: <p><strong>Câu 1.</strong> Hình bên cho thấy các thành phần cơ bản của một máy quang phổ khối, có thể được sử dụng để đo khối lượng của một ion. Một ion có khối lượng $m$, điện tích $q$ được tạo ra ở nguồn $S$.</p>

<p>Ion ban đầu đứng yên và được tăng tốc đến tốc độ $v$ nhờ hiệu điện thế $U$. Tiếp theo, ion đi vào buồng phân tách, trong đó có một từ trường đều $\\vec{B}$ vuông góc với quỹ đạo của ion.</p>

<p>Lực từ tác dụng lên ion có độ lớn:</p>

<p>\\[
F = Bv|q|
\\]</p>

<p>có phương vuông góc với cảm ứng từ $\\vec{B}$ và với vận tốc $\\vec{v}$ của hạt.</p>

<p>Bán kính quỹ đạo tròn của ion trong vùng có từ trường là $r$. Một cảm biến rộng nằm dọc theo đáy của buồng. Từ trường làm cho ion chuyển động tròn và va chạm vào cảm biến.</p>

<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 20px auto; padding: 18px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">
  <h4 style="text-align:center; margin-bottom:12px;">Mô hình máy quang phổ khối</h4>

  <svg width="100%" height="360" viewBox="0 0 640 360">
    <defs>
      <marker id="arrowMassSpec2" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="black"/>
      </marker>
    </defs>

    <rect x="220" y="40" width="350" height="160" fill="none" stroke="#4b43ff" stroke-width="4"/>

    <g fill="#29d329">
      <circle cx="250" cy="70" r="5"/><circle cx="290" cy="70" r="5"/><circle cx="330" cy="70" r="5"/><circle cx="370" cy="70" r="5"/><circle cx="410" cy="70" r="5"/><circle cx="450" cy="70" r="5"/><circle cx="490" cy="70" r="5"/><circle cx="530" cy="70" r="5"/>
      <circle cx="250" cy="110" r="5"/><circle cx="290" cy="110" r="5"/><circle cx="330" cy="110" r="5"/><circle cx="370" cy="110" r="5"/><circle cx="410" cy="110" r="5"/><circle cx="450" cy="110" r="5"/><circle cx="490" cy="110" r="5"/><circle cx="530" cy="110" r="5"/>
      <circle cx="250" cy="150" r="5"/><circle cx="290" cy="150" r="5"/><circle cx="330" cy="150" r="5"/><circle cx="370" cy="150" r="5"/><circle cx="410" cy="150" r="5"/><circle cx="450" cy="150" r="5"/><circle cx="490" cy="150" r="5"/><circle cx="530" cy="150" r="5"/>
    </g>

    <text x="370" y="125" font-size="20" font-style="italic">B</text>

    <line x1="100" y1="200" x2="530" y2="200" stroke="#cc7a00" stroke-width="4"/>
    <text x="500" y="182" font-size="15">Cảm biến</text>

    <rect x="80" y="285" width="45" height="45" fill="#d5f4ef" stroke="#333" stroke-width="2"/>
    <text x="96" y="314" font-size="18" font-style="italic">S</text>

    <line x1="102" y1="285" x2="102" y2="240" stroke="black" stroke-width="2"/>
    <line x1="102" y1="240" x2="80" y2="240" stroke="black" stroke-width="2"/>
    <line x1="80" y1="240" x2="80" y2="200" stroke="black" stroke-width="2"/>
    <line x1="80" y1="200" x2="220" y2="200" stroke="black" stroke-width="2"/>

    <line x1="65" y1="245" x2="95" y2="245" stroke="black" stroke-width="2"/>
    <line x1="70" y1="260" x2="90" y2="260" stroke="black" stroke-width="2"/>
    <text x="55" y="238" font-size="18">−</text>
    <text x="55" y="270" font-size="18">+</text>

    <line x1="125" y1="285" x2="125" y2="245" stroke="black" stroke-width="2"/>
    <line x1="125" y1="245" x2="220" y2="245" stroke="black" stroke-width="2"/>

    <line x1="220" y1="245" x2="220" y2="200" stroke="black" stroke-width="2" stroke-dasharray="8,6"/>
    <circle cx="220" cy="240" r="5" fill="red"/>
    <text x="230" y="240" font-size="16" fill="red">+q</text>

    <path d="M220 200 A120 120 0 0 1 460 200" fill="none" stroke="#666" stroke-width="2" stroke-dasharray="8,6" marker-end="url(#arrowMassSpec2)"/>
    <line x1="340" y1="200" x2="460" y2="80" stroke="#777" stroke-width="2"/>
    <text x="405" y="135" font-size="18" font-style="italic">r</text>

    <line x1="220" y1="225" x2="460" y2="225" stroke="#999" stroke-width="2"/>
    <line x1="220" y1="218" x2="220" y2="232" stroke="#999" stroke-width="2"/>
    <line x1="460" y1="218" x2="460" y2="232" stroke="#999" stroke-width="2"/>
    <text x="335" y="245" font-size="18" font-style="italic">x</text>
  </svg>
</div>

<p><strong>a)</strong> Tốc độ của ion bị thay đổi do tác dụng của lực từ trường trong máy.</p>

<p><strong>b)</strong> Biết $B = 80\\,\\text{mT}$, $U = 1000\\,\\text{V}$ và các ion có điện tích $q = +1,6\\cdot10^{-19}\\,\\text{C}$ va chạm vào cảm biến tại một điểm nằm ở vị trí $x = 1,6254\\,\\text{m}$. Khối lượng $m$ của các ion xấp xỉ là $3,4\\cdot10^{-25}\\,\\text{kg}$. <em>(Kết quả làm tròn đến hàng phần chục)</em></p>

<p><strong>c)</strong> Sau khi được tăng tốc bởi hiệu điện thế $U$, tốc độ của ion là:</p>

<p>\\[
v = \\sqrt{\\frac{2|q|U}{m}}
\\]</p>

<p><strong>d)</strong> Giá trị của $x$ được xác định là:</p>

<p>\\[
x = \\sqrt{\\frac{2mU}{|q|B^2}}
\\]</p>`,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                reference: 'Đề khảo sát kỳ thi tốt nghiệp THPT năm học 2024-2025 - Môn Vật lí, 2025, Sở GD&ĐT Hải Phòng; Phần II, Câu 1, tr. 3/5',
                solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`
            },
            {
                question: `<p><strong>Câu 2.</strong> Máy quang phổ khối là thiết bị tách các ion theo tỷ lệ điện tích trên khối lượng của chúng. Một phiên bản cụ thể là máy quang phổ khối Bainbridge được minh họa như hình dưới.</p>

<p>Các ion được tạo ra từ nguồn trước tiên được tăng tốc và đưa qua khu vực chọn vận tốc, là khu vực tồn tại đồng thời điện trường đều có cường độ điện trường $\\vec{E}$ và từ trường đều có cảm ứng từ $\\vec{B}$.</p>

<p>Trong khu vực này, lực điện và lực từ tác dụng lên ion cân bằng nhau. Lực từ tác dụng lên ion mang điện tích $q$ có độ lớn:</p>

<p>\\[
F = Bv|q|
\\]</p>

<p>có phương vuông góc với cảm ứng từ $\\vec{B}$ và với vận tốc $\\vec{v}$ của nó.</p>

<p>Tiếp theo, các ion đi vào trong vùng có từ trường đều có cảm ứng từ $\\vec{B_0}$, trong vùng này chúng chuyển động theo quỹ đạo là đường tròn bán kính $R$. Người ta dùng máy dò hạt để xác định bán kính quỹ đạo $R$ này.</p>

<div style="font-family: Arial, sans-serif; max-width: 680px; margin: 20px auto; padding: 18px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">
  <h4 style="text-align:center; margin-bottom:12px;">Máy quang phổ khối Bainbridge</h4>

  <svg width="100%" height="420" viewBox="0 0 680 420">
    <defs>
      <marker id="arrowBainbridge" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="black"/>
      </marker>
    </defs>

    <text x="245" y="30" font-size="16">Nguồn</text>
    <line x1="270" y1="35" x2="270" y2="90" stroke="black" stroke-width="2" marker-end="url(#arrowBainbridge)"/>

    <rect x="185" y="45" width="80" height="10" fill="#aaa" stroke="black"/>
    <rect x="285" y="45" width="80" height="10" fill="#aaa" stroke="black"/>
    <rect x="185" y="70" width="80" height="10" fill="#aaa" stroke="black"/>
    <rect x="285" y="70" width="80" height="10" fill="#aaa" stroke="black"/>

    <rect x="220" y="95" width="40" height="105" fill="#ddd" stroke="black" stroke-width="2"/>
    <rect x="285" y="95" width="40" height="105" fill="#ddd" stroke="black" stroke-width="2"/>

    <text x="235" y="125" font-size="20">−</text>
    <text x="235" y="160" font-size="20">−</text>
    <text x="235" y="190" font-size="20">−</text>

    <text x="300" y="125" font-size="20">+</text>
    <text x="300" y="160" font-size="20">+</text>
    <text x="300" y="190" font-size="20">+</text>

    <text x="175" y="120" font-size="18">$\\vec{B}$</text>
    <text x="340" y="120" font-size="18">$\\vec{E}$</text>
    <text x="340" y="145" font-size="15">Khu vực chọn</text>
    <text x="340" y="165" font-size="15">vận tốc</text>

    <g font-size="20">
      <text x="265" y="115">×</text><text x="265" y="145">×</text><text x="265" y="175">×</text>
      <text x="280" y="115">×</text><text x="280" y="145">×</text><text x="280" y="175">×</text>
      <text x="245" y="130">×</text><text x="300" y="130">×</text>
      <text x="245" y="160">×</text><text x="300" y="160">×</text>
    </g>

    <line x1="270" y1="80" x2="270" y2="250" stroke="black" stroke-width="2" stroke-dasharray="6,5"/>

    <rect x="185" y="210" width="80" height="10" fill="#aaa" stroke="black"/>
    <rect x="285" y="210" width="80" height="10" fill="#aaa" stroke="black"/>
    <rect x="185" y="235" width="80" height="10" fill="#aaa" stroke="black"/>
    <rect x="285" y="235" width="80" height="10" fill="#aaa" stroke="black"/>

    <g font-size="20">
      <text x="220" y="270">×</text><text x="295" y="270">×</text><text x="390" y="270">×</text><text x="470" y="270">×</text><text x="555" y="270">×</text>
      <text x="220" y="310">×</text><text x="295" y="310">×</text><text x="390" y="310">×</text><text x="470" y="310">×</text><text x="555" y="310">×</text>
      <text x="220" y="350">×</text><text x="295" y="350">×</text><text x="390" y="350">×</text><text x="470" y="350">×</text><text x="555" y="350">×</text>
      <text x="220" y="390">×</text><text x="295" y="390">×</text><text x="390" y="390">×</text><text x="470" y="390">×</text><text x="555" y="390">×</text>
    </g>

    <text x="565" y="300" font-size="18">$\\vec{B_0}$</text>

    <path d="M270 250 A120 120 0 0 0 510 250" fill="none" stroke="black" stroke-width="2" stroke-dasharray="7,5"/>
    <line x1="390" y1="250" x2="505" y2="365" stroke="black" stroke-width="2"/>
    <text x="455" y="315" font-size="18">$R$</text>

    <rect x="515" y="210" width="30" height="45" fill="#aaa" stroke="black" stroke-width="2"/>
    <text x="485" y="195" font-size="16">Máy dò hạt</text>
    <line x1="530" y1="255" x2="510" y2="250" stroke="black" stroke-width="2" stroke-dasharray="6,4"/>
  </svg>
</div>

<p><strong>a)</strong> Mối quan hệ giữa tỉ lệ độ lớn điện tích trên khối lượng $\\dfrac{|q|}{m}$ và bán kính $R$ là:</p>

<p>\\[
\\frac{|q|}{m} = \\frac{E}{BB_0R}
\\]</p>

<p><strong>b)</strong> Trong khu vực chọn vận tốc, ion chuyển động thẳng đều.</p>

<p><strong>c)</strong> Trong vùng từ trường đều $\\vec{B_0}$, lực từ làm ion chuyển động theo quỹ đạo tròn.</p>

<p><strong>d)</strong> Các ion thoát ra được khỏi khu vực chọn vận tốc đều có tốc độ:</p>

<p>\\[
v = \\frac{B}{E}
\\]</p>`,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                reference: 'Đề thi thử tốt nghiệp THPT lần 1 năm 2026 - Môn Vật lí, 2026, Sở GD&ĐT Tuyên Quang / Trường THPT Chuyên; Phần 2 Câu 2, bắt đầu từ tr. 3/4',
                solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`
            },
            {
                question: `<p><strong>Câu 3(a).</strong> Phổ khối lượng của nguyên tố magnesium được cho như hình dưới đây.</p>

<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 20px auto; padding: 18px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">
  <h4 style="text-align:center; margin-bottom:12px;">Phổ khối lượng của magnesium</h4>

  <svg width="100%" height="420" viewBox="0 0 640 420">
    <line x1="100" y1="340" x2="560" y2="340" stroke="black" stroke-width="2"/>
    <line x1="100" y1="40" x2="100" y2="340" stroke="black" stroke-width="2"/>

    <g stroke="#999" stroke-width="1">
      <line x1="100" y1="300" x2="560" y2="300"/>
      <line x1="100" y1="260" x2="560" y2="260"/>
      <line x1="100" y1="220" x2="560" y2="220"/>
      <line x1="100" y1="180" x2="560" y2="180"/>
      <line x1="100" y1="140" x2="560" y2="140"/>
      <line x1="100" y1="100" x2="560" y2="100"/>
      <line x1="100" y1="60" x2="560" y2="60"/>
    </g>

    <text x="20" y="170" font-size="18">độ phổ biến</text>
    <text x="20" y="195" font-size="18">tương đối</text>
    <text x="20" y="220" font-size="18">(%)</text>

    <text x="70" y="345" font-size="18">0</text>
    <text x="60" y="185" font-size="18">50</text>

    <text x="185" y="365" font-size="18">23</text>
    <text x="275" y="365" font-size="18">24</text>
    <text x="365" y="365" font-size="18">25</text>
    <text x="455" y="365" font-size="18">26</text>
    <text x="545" y="365" font-size="18">27</text>

    <text x="330" y="400" font-size="20">m/e</text>

    <line x1="280" y1="340" x2="280" y2="80" stroke="black" stroke-width="5"/>
    <line x1="370" y1="340" x2="370" y2="300" stroke="black" stroke-width="5"/>
    <line x1="460" y1="340" x2="460" y2="295" stroke="black" stroke-width="5"/>
  </svg>
</div>

<p><strong>(i)</strong> Từ phổ khối lượng, hãy hoàn thành bảng với độ phổ biến tương đối của ba đồng vị.</p>

<table style="border-collapse: collapse; margin: 16px auto; width: 380px; text-align: center;">
  <tr>
    <th style="border:1px solid #555; padding:8px;">Đồng vị</th>
    <th style="border:1px solid #555; padding:8px;">Độ phổ biến tương đối</th>
  </tr>
  <tr>
    <td style="border:1px solid #555; padding:8px;">$^{24}\\text{Mg}$</td>
    <td style="border:1px solid #555; padding:8px;"></td>
  </tr>
  <tr>
    <td style="border:1px solid #555; padding:8px;">$^{25}\\text{Mg}$</td>
    <td style="border:1px solid #555; padding:8px;"></td>
  </tr>
  <tr>
    <td style="border:1px solid #555; padding:8px;">$^{26}\\text{Mg}$</td>
    <td style="border:1px solid #555; padding:8px;"></td>
  </tr>
</table>

<p><strong>(ii)</strong> Sử dụng các giá trị ở phần (i) để tính nguyên tử khối tương đối $A_r$ của magnesium, làm tròn đến hai chữ số thập phân.</p>

<p style="text-align:right;">$A_r(\\text{Mg}) =$ ........................................ [1]</p>`,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                reference: 'Chemistry 9701/41 Paper 4 Structured Questions, 2015, Cambridge International Examinations/UCLES; Question 3(a), tr. 4-5/20',
                solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`
            },
            {
                question: `<p><strong>Câu 5.</strong> Hợp chất $X$ chỉ chứa các nguyên tử carbon, hydrogen và oxygen.</p>

<p>Phổ khối lượng của $X$ được ghi lại. Thông tin về hai peak có giá trị $m/e$ lớn hơn 100 được thể hiện trong Hình 5.1.</p>

<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 20px auto; padding: 18px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">
  <h4 style="text-align:center; margin-bottom:12px;">Hình 5.1. Phổ khối lượng của hợp chất $X$</h4>

  <svg width="100%" height="430" viewBox="0 0 560 430">
    <defs>
      <marker id="arrowMassSpectrumX" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill="black"/>
      </marker>
    </defs>

    <line x1="120" y1="350" x2="440" y2="350" stroke="black" stroke-width="2"/>
    <line x1="120" y1="350" x2="120" y2="60" stroke="black" stroke-width="2" marker-end="url(#arrowMassSpectrumX)"/>

    <text x="35" y="205" font-size="18">độ phổ biến</text>
    <text x="35" y="230" font-size="18">tương đối</text>

    <text x="185" y="375" font-size="18">100</text>
    <text x="255" y="375" font-size="18">101</text>
    <text x="325" y="375" font-size="18">102</text>
    <text x="395" y="375" font-size="18">103</text>

    <line x1="190" y1="350" x2="190" y2="360" stroke="black"/>
    <line x1="260" y1="350" x2="260" y2="360" stroke="black"/>
    <line x1="330" y1="350" x2="330" y2="360" stroke="black"/>
    <line x1="400" y1="350" x2="400" y2="360" stroke="black"/>

    <text x="275" y="410" font-size="18">$m/e$</text>

    <line x1="330" y1="350" x2="330" y2="80" stroke="black" stroke-width="2"/>
    <text x="315" y="70" font-size="18">100</text>

    <line x1="400" y1="350" x2="400" y2="330" stroke="black" stroke-width="2"/>
    <text x="388" y="320" font-size="18">6.5</text>
  </svg>

  <p style="text-align:center; font-weight:bold;">Fig. 5.1</p>
</div>

<p><strong>(a)</strong> Một phân tử của $X$ chứa 6 nguyên tử carbon.</p>

<p>Hãy chứng minh điều này là đúng bằng cách sử dụng thông tin từ Hình 5.1. Trình bày cách làm.</p>

<p>.................................................................................................................... [2]</p>

<p><strong>(b)</strong> Đề xuất công thức phân tử của $X$ bằng cách sử dụng thông tin từ Hình 5.1.</p>

<p>.................................................................................................................... [1]</p>

<p><strong>(c)</strong> Đề xuất công thức phân tử của mảnh ion của $X$ tại $m/e = 31$.</p>

<p>.................................................................................................................... [1]</p>`,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                reference: 'Specimen for examination from 2022, 2022, Cambridge/UCLES; Question 5(a)-(c), tr. 14-15/18.',
                solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`
            },
            {
                question: `<p><strong>(b)</strong> Phổ khối lượng của 1-iodopentane được cho như hình dưới đây.</p>

<div style="font-family: Arial, sans-serif; max-width: 660px; margin: 20px auto; padding: 18px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">
  <h4 style="text-align:center; margin-bottom:12px;">Phổ khối lượng của 1-iodopentane</h4>

  <svg width="100%" height="420" viewBox="0 0 660 420">
    <line x1="120" y1="340" x2="580" y2="340" stroke="black" stroke-width="2"/>
    <line x1="120" y1="40" x2="120" y2="340" stroke="black" stroke-width="2"/>
    <line x1="580" y1="40" x2="580" y2="340" stroke="black" stroke-width="2"/>
    <line x1="120" y1="40" x2="580" y2="40" stroke="black" stroke-width="2"/>

    <text x="25" y="170" font-size="18">cường độ</text>
    <text x="25" y="195" font-size="18">tương đối</text>

    <text x="90" y="345" font-size="16">0</text>
    <text x="85" y="295" font-size="16">20</text>
    <text x="85" y="235" font-size="16">40</text>
    <text x="85" y="175" font-size="16">60</text>
    <text x="85" y="115" font-size="16">80</text>
    <text x="75" y="55" font-size="16">100</text>

    <text x="140" y="365" font-size="16">20</text>
    <text x="195" y="365" font-size="16">40</text>
    <text x="250" y="365" font-size="16">60</text>
    <text x="305" y="365" font-size="16">80</text>
    <text x="360" y="365" font-size="16">100</text>
    <text x="420" y="365" font-size="16">120</text>
    <text x="480" y="365" font-size="16">160</text>
    <text x="545" y="365" font-size="16">200</text>

    <text x="330" y="395" font-size="18">$m/z$</text>

    <line x1="160" y1="340" x2="160" y2="285" stroke="black" stroke-width="2"/>
    <line x1="190" y1="340" x2="190" y2="310" stroke="black" stroke-width="2"/>
    <line x1="200" y1="340" x2="200" y2="260" stroke="black" stroke-width="2"/>
    <line x1="207" y1="340" x2="207" y2="55" stroke="black" stroke-width="3"/>
    <line x1="235" y1="340" x2="235" y2="315" stroke="black" stroke-width="2"/>

    <line x1="272" y1="340" x2="272" y2="135" stroke="black" stroke-width="3"/>
    <line x1="405" y1="340" x2="405" y2="335" stroke="black" stroke-width="2"/>
    <line x1="438" y1="340" x2="438" y2="336" stroke="black" stroke-width="2"/>
    <line x1="472" y1="340" x2="472" y2="334" stroke="black" stroke-width="2"/>
    <line x1="574" y1="340" x2="574" y2="325" stroke="black" stroke-width="2"/>

    <text x="187" y="100" font-size="20" font-weight="bold">Z</text>
    <text x="252" y="160" font-size="20" font-weight="bold">Y</text>
    <text x="552" y="320" font-size="20" font-weight="bold">X</text>
  </svg>
</div>

<p><strong>(i)</strong> Peak được kí hiệu $X$ cho biết thông tin gì? Biết $m/z = 198$.</p>

<p>.................................................................................................................... [1]</p>

<p><strong>(ii)</strong> Viết công thức cấu tạo của các ion tạo ra các peak được kí hiệu $Y$ và $Z$.</p>

<p>$Y$ $(m/z = 71)$ ....................................................................................................................</p>

<p>$Z$ $(m/z = 43)$ .................................................................................................................... [2]</p>

<p><strong>(c)</strong> 2-iodo-2-methylbutane là một đồng phân của 1-iodopentane.</p>

<p><strong>(i)</strong> Vẽ cấu trúc của 2-iodo-2-methylbutane.</p>

<p>.................................................................................................................... [1]</p>

<p><strong>(ii)</strong> Đề xuất <strong>một điểm giống nhau</strong> và <strong>một điểm khác nhau</strong> giữa phổ khối lượng của 1-iodopentane và 2-iodo-2-methylbutane.</p>

<p>Điểm giống nhau ....................................................................................................................</p>

<p>....................................................................................................................</p>

<p>Điểm khác nhau ....................................................................................................................</p>

<p>.................................................................................................................... [2]</p>`,
                options: [],
                correct_answer: "",
                level: 'HARD',
                type: 'Essay',
                reference: 'Chemistry A - H032/02 Depth in Chemistry, 2019, OCR; Question 3(b)-(c), tr. 9-10/20',
                solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`
            }
            // {
            //     question: ``,
            //     options: [],
            //     correct_answer: "",
            //     level: 'HARD',
            //     type: 'Essay',
            //     reference: 'GCSE (9-1) Chemistry A J248/04, 2021, OCR; mục (a), tr. 29',
            //     solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`
            // },
            // {
            //     question: ``,
            //     options: [],
            //     correct_answer: "",
            //     level: 'HARD',
            //     type: 'Essay',
            //     reference: 'A Level Chemistry B (Salters) Fundamentals of Chemistry, 2024, OCR; mục (f), quanh tr. 36',
            //     solution: `Đáp án đang được đội ngũ PhysicMUT biên soạn`
            // },
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
