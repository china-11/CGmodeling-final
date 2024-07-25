//22Fi084 中村千菜
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as CANNON from 'cannon-es';

class ThreeJSContainer {
    private scene: THREE.Scene;
    private light: THREE.Light;

    constructor() {
    }

    private camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    // 画面部分の作成(表示する枠ごとに)*
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x495ed));
        renderer.shadowMap.enabled = true; //シャドウマップを有効にする

        this.camera.position.set(15, 7, 0); // カメラの位置調整
        this.camera.lookAt(new THREE.Vector3(0, 0, 0)); // 原点を向く

        const orbitControls = new OrbitControls(this.camera, renderer.domElement);

        this.createScene();
        // 毎フレームのupdateを呼んで，render
        // reqestAnimationFrame により次フレームを呼ぶ
        const render: FrameRequestCallback = (time) => {
            orbitControls.update();
            renderer.render(this.scene, this.camera);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    }

    // シーンの作成(全体で1回)
    private createScene = () => {
        this.scene = new THREE.Scene();
        const textureLoader = new THREE.TextureLoader();
        const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });

        world.defaultContactMaterial.restitution = 0.8;
        world.defaultContactMaterial.friction = 0.03;

        //車体の生成
        const carBody = new CANNON.Body({ mass: 5 });
        const carBodyShape = new CANNON.Box(new CANNON.Vec3(4, 0.5, 2));
        carBody.addShape(carBodyShape);
        carBody.position.y = 1;
        //タイヤの生成
        const vehicle = new CANNON.RigidVehicle({ chassisBody: carBody });
        const wheelShape = new CANNON.Sphere(1);
        //左前輪
        const frontLeftWheelBody = new CANNON.Body({ mass: 1 });
        frontLeftWheelBody.addShape(wheelShape);
        frontLeftWheelBody.angularDamping = 0.4;
        vehicle.addWheel({
            body: frontLeftWheelBody,
            position: new CANNON.Vec3(-2, 0, 2.5)
        });
        //右前輪
        const frontRightWgeelBody = new CANNON.Body({ mass: 1 });
        frontRightWgeelBody.addShape(wheelShape);
        frontRightWgeelBody.angularDamping = 0.4;
        vehicle.addWheel({
            body: frontRightWgeelBody,
            position: new CANNON.Vec3(-2, 0, -2.5)
        });
        //左後輪
        const backLeftWheelBody = new CANNON.Body({ mass: 1 });
        backLeftWheelBody.addShape(wheelShape);
        backLeftWheelBody.angularDamping = 0.4;
        vehicle.addWheel({
            body: backLeftWheelBody,
            position: new CANNON.Vec3(2, 0, 2.5)
        });
        //右後輪
        const backRightWheelBody = new CANNON.Body({ mass: 1 });
        backRightWheelBody.addShape(wheelShape);
        backRightWheelBody.angularDamping = 0.4;
        vehicle.addWheel({
            body: backRightWheelBody,
            position: new CANNON.Vec3(2, 0, -2.5)
        });

        //物理演算空間
        const wheelGeometry = new THREE.SphereGeometry(1);
        const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const frontLeftMesh1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
        const frontLeftMesh2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
        const frontLeftMesh3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
        const frontLeftMesh4 = new THREE.Mesh(wheelGeometry, wheelMaterial);

        this.scene.add(frontLeftMesh1);
        this.scene.add(frontLeftMesh2);
        this.scene.add(frontLeftMesh3);
        this.scene.add(frontLeftMesh4);
        vehicle.addToWorld(world);

        //車のテクスチャ―読み込み
        const texture_carTop = textureLoader.load('img/car.png');
        const texture_carFace = textureLoader.load('img/carFace.png')
        const texrute_carBack = textureLoader.load('img/carBack.png');
        // ジオメトリを作成
        const boxGeometry = new THREE.BoxGeometry(8, 2, 4);
        // 上面の材料
        const material_carTop = new THREE.MeshBasicMaterial({ map: texture_carTop });
        const material_carBuck = new THREE.MeshBasicMaterial({ map: texrute_carBack });
        const material_carFace = new THREE.MeshBasicMaterial({ map: texture_carFace });
        const material_other = new THREE.MeshBasicMaterial({ color: 0xff0000 });//赤

        // 6面の材料を配列に格納
        const materials = [
            material_carBuck, //後ろ面
            material_carFace, //前面
            material_carTop,   // 上面
            material_other,
            material_other,
            material_other
        ];

        // メッシュを作成
        const boxMesh = new THREE.Mesh(boxGeometry, materials);
        this.scene.add(boxMesh);

        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        //芝生
        const texture_grass = textureLoader.load('img/grass.png', () => {
            // テクスチャが読み込まれた後に実行されるコールバック
            console.log('Texture_grass loaded successfully');

            // テクスチャのリピートとオフセットを設定
            texture_grass.wrapS = THREE.RepeatWrapping;
            texture_grass.wrapT = THREE.RepeatWrapping;
            texture_grass.repeat.set(100, 100); // 画像を2x2回繰り返す
            texture_grass.offset.set(0, 0); // テクスチャの表示位置
        });
        const phongMaterial_grass = new THREE.MeshPhongMaterial({ map: texture_grass });
        const planeGeometry_grass = new THREE.PlaneGeometry(150, 150);
        const planeMesh_grass = new THREE.Mesh(planeGeometry_grass, phongMaterial_grass);
        planeMesh_grass.material.side = THREE.DoubleSide; // 両面表示
        planeMesh_grass.rotateX(-Math.PI / 2);
        this.scene.add(planeMesh_grass);

        //コンクリート縦
        const texture_concreate_h = textureLoader.load('img/concrete_h.png');
        const Material_con_h = new THREE.MeshPhongMaterial({ map: texture_concreate_h });
        const Geometry_con_h = new THREE.PlaneGeometry(150, 10);
        const planeMesh_can_h = new THREE.Mesh(Geometry_con_h, Material_con_h);
        planeMesh_can_h.material.side = THREE.DoubleSide; // 両面表示
        planeMesh_can_h.rotateX(-Math.PI / 2);
        planeMesh_can_h.position.y = 0.2;
        this.scene.add(planeMesh_can_h);
        //コンクリート横
        const texture_can_w = textureLoader.load('img/concrete_w.png');
        const phongMaterial_con_w = new THREE.MeshPhongMaterial({ map: texture_can_w });
        const planeGeometry_con_w = new THREE.PlaneGeometry(10, 150);
        const planeMesh_con_w = new THREE.Mesh(planeGeometry_con_w, phongMaterial_con_w);
        planeMesh_con_w.material.side = THREE.DoubleSide; // 両面表示
        planeMesh_con_w.rotateX(-Math.PI / 2);
        planeMesh_con_w.position.set(-10, 0.1, 0);
        this.scene.add(planeMesh_con_w);

        //駐車場
        const texture_parking = textureLoader.load('img/parking.png');
        const phongMaterial_parking = new THREE.MeshPhongMaterial({ map: texture_parking });
        const planeGeometry_parking = new THREE.PlaneGeometry(30, 50);
        const planeMesh_parking = new THREE.Mesh(planeGeometry_parking, phongMaterial_parking);
        planeMesh_parking.material.side = THREE.DoubleSide; // 両面表示
        planeMesh_parking.rotateX(-Math.PI / 2);
        planeMesh_parking.rotateZ(-Math.PI / 2);
        planeMesh_parking.position.set(20, 0.1, -20);
        this.scene.add(planeMesh_parking);

        //物理演算の平面
        const planeShape = new CANNON.Plane()
        const planeBody = new CANNON.Body({ mass: 0 })
        planeBody.addShape(planeShape)
        planeBody.position.set(planeMesh_grass.position.x, planeMesh_grass.position.y, planeMesh_grass.position.z);
        planeBody.quaternion.set(planeMesh_grass.quaternion.x, planeMesh_grass.quaternion.y, planeMesh_grass.quaternion.z, planeMesh_grass.quaternion.w);

        world.addBody(planeBody)

        //車の操作(押したとき加速)
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    vehicle.setWheelForce(10, 0);
                    vehicle.setWheelForce(10, 1);
                    break;
                case 'ArrowDown':
                    vehicle.setWheelForce(-10, 0);
                    vehicle.setWheelForce(-10, 1);
                    break;
                case 'ArrowLeft':
                    vehicle.setSteeringValue(THREE.MathUtils.degToRad(30), 0);
                    vehicle.setSteeringValue(THREE.MathUtils.degToRad(30), 1);
                    break;
                case 'ArrowRight':
                    vehicle.setSteeringValue(-THREE.MathUtils.degToRad(30), 0);
                    vehicle.setSteeringValue(-THREE.MathUtils.degToRad(30), 1);
                    break;
            }
        });
        //車の操作(離したとき減速)
        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowRight':
                case 'ArrowLeft':
                    vehicle.setWheelForce(0, 0);
                    vehicle.setWheelForce(0, 1);
                    break;
            }
        });

        //信号の棒
        const texture_lightPole = textureLoader.load('img/lightPole2.png');
        const geometry_pole = new THREE.CylinderGeometry(0.5, 0.5, 10, 32);
        const material_pole = new THREE.MeshBasicMaterial({ map: texture_lightPole });
        const cylinder = new THREE.Mesh(geometry_pole, material_pole);
        cylinder.position.set(-13, 5.5, -5);
        this.scene.add(cylinder);

        //信号のバックのフレーム
        const geometry_frame = new THREE.BoxGeometry(1, 2, 5);
        const material_frame = new THREE.MeshBasicMaterial({ map: texture_lightPole });
        const cube_frame = new THREE.Mesh(geometry_frame, material_frame);
        cube_frame.position.set(-13, 10, -3);
        this.scene.add(cube_frame);

        const texture_redLight = textureLoader.load('img/redLight.png');
        const texture_yellowLight = textureLoader.load('img/yellowLight.png');
        const texture_blueLight = textureLoader.load('img/blueLight.png');

        //信号の色
        const generateSprite = (index: number) => {
            const geometry_Mesh: THREE.Mesh[] = [];
            const geometry_circle = new THREE.CircleGeometry(0.5, 32);
            let material_circle = new THREE.MeshBasicMaterial();
            switch (index) {
                //青
                case 0:
                case 1:
                case 2:
                case 3:
                    for (let i = 0; i < 3; i++) {
                        if (i == 0) {
                            material_circle = new THREE.MeshBasicMaterial({ map: texture_blueLight });
                        }
                        if (i == 1) {
                            material_circle = new THREE.MeshBasicMaterial({ color: 0x808080 });
                        }
                        if (i == 2) {
                            material_circle = new THREE.MeshBasicMaterial({ color: 0x808080 });
                        }
                        geometry_Mesh.push(new THREE.Mesh(geometry_circle, material_circle))
                        geometry_Mesh[i].rotation.set(0, Math.PI / 2, 0);
                        geometry_Mesh[i].position.set(-12.4, 10, -1.5 + -i * 1.5);

                        this.scene.add(geometry_Mesh[i]);
                    }
                    break;
                //黄色
                case 4:
                case 5:
                    for (let i = 0; i < 3; i++) {
                        if (i == 0) {
                            material_circle = new THREE.MeshBasicMaterial({ color: 0x808080 });
                        }
                        if (i == 1) {
                            material_circle = new THREE.MeshBasicMaterial({ map: texture_yellowLight });
                        }
                        if (i == 2) {
                            material_circle = new THREE.MeshBasicMaterial({ color: 0x808080 });
                        }
                        geometry_Mesh.push(new THREE.Mesh(geometry_circle, material_circle))
                        geometry_Mesh[i].rotation.set(0, Math.PI / 2, 0);
                        geometry_Mesh[i].position.set(-12.4, 10, -1.5 + -i * 1.5);

                        this.scene.add(geometry_Mesh[i]);
                    }
                    break;
                //赤
                case 6:
                case 7:
                case 8:
                case 9:
                    for (let i = 0; i < 3; i++) {
                        if (i == 0) {
                            material_circle = new THREE.MeshBasicMaterial({ color: 0x808080 });
                        }
                        if (i == 1) {
                            material_circle = new THREE.MeshBasicMaterial({ color: 0x808080 });
                        }
                        if (i == 2) {
                            material_circle = new THREE.MeshBasicMaterial({ map: texture_redLight });
                        }
                        geometry_Mesh.push(new THREE.Mesh(geometry_circle, material_circle))
                        geometry_Mesh[i].rotation.set(0, Math.PI / 2, 0);
                        geometry_Mesh[i].position.set(-12.4, 10, -1.5 + -i * 1.5);

                        this.scene.add(geometry_Mesh[i]);
                    }
                    break;
            }


        }
        // //アーチ
        // const geometry_arch = new THREE.TorusGeometry(5, 1, 10, 100);
        // const material_arch = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        // const arch = new THREE.Mesh(geometry_arch, material_arch);
        // arch.position.x = -50;
        // arch.rotateY(Math.PI / 2);

        // this.scene.add(arch);

        //ドーム
        const texture_dome = textureLoader.load('img/dome.png')
        let pointNum = 10;
        const r = 20;
        let points: THREE.Vector2[] = [];
        for (let i = 0; i < pointNum; ++i) {
            points.push(new THREE.Vector2(r * Math.cos(Math.PI / 2 * i / (pointNum - 1) - Math.PI / 2),
                -r * Math.sin(Math.PI / 2 * i / (pointNum - 1) - Math.PI / 2)));
        }
        let latheGeometry_dom = new THREE.LatheGeometry(points);
        let latheMaterial_dom = new THREE.MeshBasicMaterial({ map: texture_dome, side: THREE.DoubleSide });
        let latheMesh_dom = new THREE.Mesh(latheGeometry_dom, latheMaterial_dom);
        latheMesh_dom.position.set(30 + r, 0, 30 + r);
        this.scene.add(latheMesh_dom);

        //コンビニ
        const texture_conF = textureLoader.load('img/conveniFace.png');
        const texture_con = textureLoader.load('img/conveniKabe.png');
        const material_conF = new THREE.MeshBasicMaterial({ map: texture_conF });
        const material_con = new THREE.MeshBasicMaterial({ map: texture_con });
        const geometry_con = new THREE.BoxGeometry(50, 12, 30);
        //テクスチャ―を張り付ける
        const materials_con = [
            material_con, // 右面
            material_con, // 左面
            material_con,   // 上面
            material_con, // 底面
            material_conF, // 前面
            material_con  // 背面
        ];
        const mesh_con = new THREE.Mesh(geometry_con, materials_con);
        mesh_con.position.set(20, 6, -45);

        this.scene.add(mesh_con);

        //ビル
        let x, y, z;
        let textureIndex = 0;
        // ランダムな値を生成する関数
        function getRandom(min, max) {
            return Math.random() * (max - min) + min;
        }
        //複数のテクスチャ―読み込み
        const texture_builds = [
            textureLoader.load('img/build1.png'),
            textureLoader.load('img/build2.png'),
            textureLoader.load('img/build3.png'),
            textureLoader.load('img/build4.png'),
            textureLoader.load('img/build5.png'),
            textureLoader.load('img/build6.png'),
            textureLoader.load('img/build7.png'),
            textureLoader.load('img/build8.png'),
            textureLoader.load('img/build9.png'),
            textureLoader.load('img/build10.png'),
            textureLoader.load('img/build11.png'),
            textureLoader.load('img/build12.png')
        ];
        // ビル生成
        for (let zp = -60; zp <= 60; zp += 30) {
            for (let xp = -60; xp <= 60; xp += 30) {
                x = getRandom(20, 25);
                y = getRandom(5, 40);
                z = x;
                let geometry_build;
                if (xp == 30 && zp == -30 || xp == -30 && zp == 30 || xp == -60 && zp == -60) {
                    geometry_build = new THREE.CylinderGeometry(x / 2, x / 2, y, z);

                } else {
                    geometry_build = new THREE.BoxGeometry(x, y, z);

                }
                const texture_build = texture_builds[textureIndex];
                const material_build = new THREE.MeshBasicMaterial({ map: texture_build });
                const build = new THREE.Mesh(geometry_build, material_build);
                textureIndex = (textureIndex + 1) % texture_builds.length;
                if (xp > 0 && zp > 0) {
                    break;
                }
                build.position.set(xp, y / 2, zp); // 手前、縦、左
                if ((0 > xp || xp > 15) && (0 > zp || zp > 15) && xp !== 30) {
                    this.scene.add(build);
                }
            }
        }

        //人間
        let hx: number[] = [
            //++象限
            63, 50, 66, 10, 10,
            20, 40, 30, 50, 10,
            7, 13, 15, 9, 10,
            22, 24, 26, 28, 30,
            //+-象限
            10, 12, 24, 28, 29, 60, 63,
            //-+
            -22, -30, -40, -41, -60, -25, -69,
            //--象限
            - 15, -17, -30, -60, -60];
        let hz: number[] = [
            //++象限
            20, 23, 20, 15, 10,
            70, 20, 25, 20, 30,//ドーム回り
            46, 48, 49, 49, 50,//並び部前の人
            50, 50, 50, 50, 50//並んでる人
            //+-象限
            - 10, -12, -22, -25, -23, -10, -12,
            //-+
            12, 42, 44, 40, 10, 45, 8,
            //--象限
            - 10, -17, -13, -13, -8, 10
        ];

        //顔
        for (let i = 0; i < 100; i++) {
            const hFace_geometry = new THREE.SphereGeometry(1, 32, 16);
            const hFace_material = new THREE.MeshBasicMaterial({ color: 0xffdab9 });
            const hFace_sphere = new THREE.Mesh(hFace_geometry, hFace_material);
            hFace_sphere.position.set(hx[i], 3.5, hz[i]);

            this.scene.add(hFace_sphere);

            //体
            const hBody_geometry = new THREE.ConeGeometry(1, 3, 32);
            let hBody_material = new THREE.MeshBasicMaterial({ color: 0xadd8e6 });
            if (i % 2 == 0) {
                hBody_material = new THREE.MeshBasicMaterial({ color: 0xffb6c1 });
            }
            const hBody_cone = new THREE.Mesh(hBody_geometry, hBody_material);
            hBody_cone.position.set(hx[i], 2.5, hz[i]);
            this.scene.add(hBody_cone);


            //足
            const hLegR_geometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
            const hLegR_material = new THREE.MeshBasicMaterial({ color: 0xffdab9 });
            const hRegR_cylinder = new THREE.Mesh(hLegR_geometry, hLegR_material);
            hRegR_cylinder.position.set(hx[i], 0.5, hz[i] + 0.25);

            this.scene.add(hRegR_cylinder);

            const hLegL_geometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
            const hLegL_material = new THREE.MeshBasicMaterial({ color: 0xffdab9 });
            const hRegL_cylinder = new THREE.Mesh(hLegL_geometry, hLegL_material);
            hRegL_cylinder.position.set(hx[i], 0.5, hz[i] - 0.25);
            this.scene.add(hRegL_cylinder);


            //腕
            const hArmR_geometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
            const hArmR_material = new THREE.MeshBasicMaterial({ color: 0xffdab9 });
            const hArmR_cylinder = new THREE.Mesh(hArmR_geometry, hArmR_material);
            hArmR_cylinder.position.set(hx[i], 1.8, hz[i] + 1);
            hArmR_cylinder.rotateX(-Math.PI / 4);

            this.scene.add(hArmR_cylinder);

            const hArmL_geometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
            const hArmL_material = new THREE.MeshBasicMaterial({ color: 0xffdab9 });
            const hArmL_cylinder = new THREE.Mesh(hArmL_geometry, hArmL_material);
            hArmL_cylinder.position.set(hx[i], 1.8, hz[i] - 1);
            hArmL_cylinder.rotateX(Math.PI / 4);
            this.scene.add(hArmL_cylinder);

        }



        let i = 0;
        let update: FrameRequestCallback = (time) => {
            //物理演算を実行

            world.fixedStep();

            //キーボードでの車の操作
            //車体
            boxMesh.position.set(carBody.position.x, carBody.position.y, carBody.position.z);
            boxMesh.quaternion.set(carBody.quaternion.x, carBody.quaternion.y, carBody.quaternion.z, carBody.quaternion.w);
            //タイヤ
            frontLeftMesh1.position.set(frontLeftWheelBody.position.x, frontLeftWheelBody.position.y, frontLeftWheelBody.position.z);
            frontLeftMesh1.quaternion.set(frontLeftWheelBody.quaternion.x, frontLeftWheelBody.quaternion.y, frontLeftWheelBody.quaternion.z, frontLeftWheelBody.quaternion.w);
            frontLeftMesh2.position.set(frontRightWgeelBody.position.x, frontRightWgeelBody.position.y, frontRightWgeelBody.position.z);
            frontLeftMesh2.quaternion.set(frontRightWgeelBody.quaternion.x, frontRightWgeelBody.quaternion.y, frontRightWgeelBody.quaternion.z, frontRightWgeelBody.quaternion.w);
            frontLeftMesh3.position.set(backLeftWheelBody.position.x, backLeftWheelBody.position.y, backLeftWheelBody.position.z);
            frontLeftMesh3.quaternion.set(backLeftWheelBody.quaternion.x, backLeftWheelBody.quaternion.y, backLeftWheelBody.quaternion.z, backLeftWheelBody.quaternion.w);
            frontLeftMesh4.position.set(backRightWheelBody.position.x, backRightWheelBody.position.y, backRightWheelBody.position.z);
            frontLeftMesh4.quaternion.set(backRightWheelBody.quaternion.x, backRightWheelBody.quaternion.y, backRightWheelBody.quaternion.z, backRightWheelBody.quaternion.w);

            //信号機の点滅
            generateSprite(i % 10);
            i += 0.0625;

            // this.camera.lookAt(
            //     carBody.position.x - 10,
            //     carBody.position.y + 5,
            //     carBody.position.z 
            // )
            // this.camera.position.set(
            //     carBody.position.x+5 ,
            //     carBody.position.y+5 ,
            //     0
            // );

            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

}

window.addEventListener("DOMContentLoaded", init);

function init() {
    let container = new ThreeJSContainer();

    let viewport = container.createRendererDOM(640, 480, new THREE.Vector3(5, 5, 5),);
    document.body.appendChild(viewport);
}
