'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter_bootstrap.js": "e3415bb506ff50b830f97c7039dae36d",
"version.json": "ff367f66d05227bf6ef6298e4c41e48e",
"index.html": "a85c63765af503b185a2106d73e93906",
"/": "a85c63765af503b185a2106d73e93906",
"main.dart.js": "7bf42a6513ff35cc2147f1497dc1a4f2",
"flutter.js": "24bc71911b75b5f8135c949e27a2984e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "64057c0821da0157991ec8fb20c39422",
"assets/NOTICES": "ee514c0771051c0ad2c3e2cb88716f2f",
"assets/FontManifest.json": "aed2b02323ee1c15e32a18f07088b8e3",
"assets/AssetManifest.bin.json": "0f84b342fca345212ba1d9ddd7ae2ecb",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/packages/iconsax_flutter/fonts/FlutterIconsax.ttf": "6ebc7bc5b74956596611c6774d8beb5b",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/shaders/stretch_effect.frag": "40d68efbbf360632f614c731219e95f0",
"assets/AssetManifest.bin": "a4fa46b14ec36e465de59f38c456ad1c",
"assets/fonts/MaterialIcons-Regular.otf": "7b0d359a9f76cbe3290529f14d8e790b",
"assets/assets/images/maps/map_placeholder.png": "4cceae515dba2933203aca924e94e8ee",
"assets/assets/images/maps/map_placeholder2.png": "f0c5340047af830b075f90f5eb829299",
"assets/assets/images/bots/wood_bot_1.png": "b3ae1bbaa9ed352d127277128bfe0a32",
"assets/assets/images/bots/boss_wind_matriarch.png": "8cc40f7d9b0e1f7fd3bfea22515e3fc2",
"assets/assets/images/bots/boss_abyss_behemoth.png": "9f9cef012dc7138352b1043c774e828c",
"assets/assets/images/bots/lightning_bot_1.png": "ed3027e5e6a5dbcd3c163989ec47abb5",
"assets/assets/images/bots/fire_bot_1.png": "54d22a5ea3850370770c9b0b55792f99",
"assets/assets/images/bots/wind_walker_bot.png": "593411e1981229fb5e143b17e9065c61",
"assets/assets/images/bots/water_guardian.png": "43db9562bd887229c3e60b0995229356",
"assets/assets/images/bots/wood_shama1n.png": "d73fbe5f4185a294026130f6f3f9a375",
"assets/assets/images/bots/earth_bot_1.png": "6c0f89238a06a1e1466bd327fcd99efc",
"assets/assets/images/bots/fire_wolf.png": "a1b9a4d4998cda0960f02e992eeb0130",
"assets/assets/images/bots/wood_shaman.png": "a186599d1836312cb6855da2abc34780",
"assets/assets/images/bots/lightning_bot.png": "ee8248a424b1215b498db15fca33546a",
"assets/assets/images/bots/water_bot_1.png": "56c47f42895e5f5d474edcbda146eded",
"assets/assets/images/bots/earth_bot.png": "d8fd3b9772d24c9619b2be8d04c370a0",
"assets/assets/images/bots/bandit.png": "0cd7d2b8ae068f7cdc4d664a4f6de79f",
"assets/assets/images/players/earth_guardian.png": "b76e16834a6f020bc2c1b823c15f70b8",
"assets/assets/images/players/wind_walker.png": "68365c2e2f020b0dcc1efb4414e4903a",
"assets/assets/images/players/water_mage.png": "9234d701d1f2e8edd6e455efd9acec04",
"assets/assets/images/players/fire_swordsman.png": "4fd279d846355407a9b9f01a58363381",
"assets/assets/images/players/wood_healer.png": "cf478e2213afa5f6126e389dc760d6c9",
"assets/assets/images/players/lightning_assassin.png": "ba57ba97641d113fd1395b79f55bd58b",
"assets/assets/images/tiles/basic_sword.png": "50d53759558015fec8b29e3e3bc15b35",
"assets/assets/images/tiles/energy.png": "2101129ae5f5d9d5e8884d4c7f9f2a2a",
"assets/assets/images/tiles/advanced_sword.png": "650f6edab1b315cd48c251ced4169ff0",
"assets/assets/images/tiles/exp.png": "93692e631fee5fd3a2a82d09c026b39a",
"assets/assets/images/tiles/special_sword.png": "c9cb2050cb96b0c179ee86f415fa2ff8",
"assets/assets/images/tiles/hp.png": "7a3f1a119eefddc5e97e2a3100783c2f",
"assets/assets/images/tiles/clock.png": "abef4a8bdf1625ddb2b93e7c420f5217",
"assets/assets/images/tiles/gold.png": "685c4c0f22b599b33503a31b5e08c96e",
"assets/assets/images/backgrounds/bg_battle.png": "6910275547d0aea733a9d180d8612b46",
"assets/assets/images/backgrounds/bg_login.png": "e2ef5020d79ba40874424123cfa68d1a",
"assets/assets/images/backgrounds/challenge/challenge_bg_10.jpg": "ff070f0e159cf42c9804038d56f9e80e",
"assets/assets/images/backgrounds/challenge/challenge_bg_9.jpg": "2a4c568e1659b81261683a5e76235e80",
"assets/assets/images/backgrounds/challenge/challenge_bg_8.jpg": "bf205e18ee44deb0d515693c1e4f3d6f",
"assets/assets/images/backgrounds/challenge/challenge_bg_1.jpg": "226d82316be1e013101ef7398dff894b",
"assets/assets/images/backgrounds/challenge/challenge_bg_3.jpg": "bedacdfe342f2939ba56213eb4815d93",
"assets/assets/images/backgrounds/challenge/challenge_bg_2.jpg": "b00f932f73dd52119b0f9c62df270ca9",
"assets/assets/images/backgrounds/challenge/challenge_bg_6.jpg": "d7784590963fb179b73f721301eda1a7",
"assets/assets/images/backgrounds/challenge/challenge_bg_7.jpg": "11ca727c8cc1ace7a76906d1de83717f",
"assets/assets/images/backgrounds/challenge/challenge_bg_5.jpg": "14a8eea6a45623cef084f975103608e6",
"assets/assets/images/backgrounds/challenge/challenge_bg_4.png": "2932423b1bc00160e210d6fe9f89caf0",
"assets/assets/images/skills/wind_skill_3.png": "340593a62ba6d3b6cb5945f09dd3f23a",
"assets/assets/images/skills/item1.png": "677adc5428dae3c7cf924b487d7ee31e",
"assets/assets/images/skills/wind_skill_2.png": "ccc84301ef92af75263f4060b5ebac27",
"assets/assets/images/skills/item2.png": "5aa24dc8757784c3ea8f9b8f4fe8ec45",
"assets/assets/images/skills/item3.png": "6d67712a6d7ccbe9189292368a31b82a",
"assets/assets/images/skills/wind_skill_1.png": "0a3919cc39f864f9605d3450416cb7c8",
"assets/assets/images/skills/wind_skill_5.png": "75d9da4620e0ea8fa68a3d4623fc9443",
"assets/assets/images/skills/item6.png": "99282b4b5b82417507ac5465efa6ae5f",
"assets/assets/images/skills/wind_skill_4.png": "c104debbcc8f093f68a8fa72f4a96744",
"assets/assets/images/skills/item4.png": "2d227210b8b45b3b6d1543032a02a0ee",
"assets/assets/images/skills/item5.png": "aba927e97f21a712024b6834f6eb4156",
"assets/assets/images/skills/earth_skill_4.png": "153a1a4a7aea62b14d1adfeace5b8ff8",
"assets/assets/images/skills/earth_skill_5.png": "8515a42409d51aee803370fc89a20d69",
"assets/assets/images/skills/earth_skill_2.png": "c81ddf0b5f5dddc6fa969a2d06ccb1fa",
"assets/assets/images/skills/earth_skill_3.png": "76d8b109077846fe88fe8fd1681ee727",
"assets/assets/images/skills/earth_skill_1.png": "8eee1e55f3e33a5d5979471d48536a79",
"assets/assets/images/skills/water_skill_1.png": "a236a7f7caf550acafc156972c0171a8",
"assets/assets/images/skills/lightning_skill_5.png": "fe5ccda85ce51d29252f3f576db4e5e4",
"assets/assets/images/skills/wood_skill_4.png": "2656262dec0eec844df851bccc68a0a8",
"assets/assets/images/skills/water_skill_3.png": "ee10813cd1fa4ad319f46af0938584eb",
"assets/assets/images/skills/fire_skill_5.png": "4bcafb6d988c14b0c1a783678da9fcfa",
"assets/assets/images/skills/fire_skill_4.png": "07c824f6d6f938e508db7ab2dcde7f31",
"assets/assets/images/skills/water_skill_2.png": "1ccf5205b49f913082e0b1d2c3c8efe0",
"assets/assets/images/skills/wood_skill_5.png": "c2990f905c75166b6dd124bcb815eef5",
"assets/assets/images/skills/lightning_skill_4.png": "23cad9b5985fbafd4632a41c768a0f0e",
"assets/assets/images/skills/wood_skill_1.png": "ee08e12fc6dc836945336dc7837365a4",
"assets/assets/images/skills/fire_skill_1.png": "8ac536176b1a8731f4d3cdfbb4606360",
"assets/assets/images/skills/lightning_skill_1.png": "cff450cc621e3fc110aa81c70e5c355b",
"assets/assets/images/skills/lightning_skill_3.png": "c0391cbb28fae576cdddf70eced9618d",
"assets/assets/images/skills/wood_skill_2.png": "eec640b4ee55da218649b8e67d4201de",
"assets/assets/images/skills/water_skill_5.png": "46d2e5b911bebf001e696e1b9eea451c",
"assets/assets/images/skills/fire_skill_3.png": "52f80c31128596f66f5b18f6ed640d62",
"assets/assets/images/skills/fire_skill_2.png": "969f3b7737a7cbad066776ccf1b1bfd8",
"assets/assets/images/skills/water_skill_4.png": "4ef7ad20c68d63ff1ee9e12800947ce0",
"assets/assets/images/skills/gif/earth_skill_4.gif": "7389fe5f6e1d005c2b656e18df0bfe78",
"assets/assets/images/skills/gif/earth_skill_5.gif": "3666ac6186b61468657e11bfa0226c04",
"assets/assets/images/skills/gif/earth_skill_2.gif": "ae9aab67ffe320310fb363fcde0df44b",
"assets/assets/images/skills/gif/earth_skill_3.gif": "a2c91d069c577f908cdb2c2041df4c61",
"assets/assets/images/skills/gif/earth_skill_1.gif": "069397805c82397a3a72c09a48e9e21d",
"assets/assets/images/skills/gif/water_skill_1.gif": "f9dee85766864a3d4d754c13c441044a",
"assets/assets/images/skills/gif/lightning_skill_5.gif": "de017014a900dbda43b0999171b9ccdf",
"assets/assets/images/skills/gif/water_skill_3.gif": "7e5162d68856e4cdfaf10729f20c1a85",
"assets/assets/images/skills/gif/wood_skill_4.gif": "ae1e14e5b236761670db10d3b7636ca1",
"assets/assets/images/skills/gif/fire_skill_5.gif": "a623a1308d167e64e12e55f534aec847",
"assets/assets/images/skills/gif/fire_skill_4.gif": "40504a5728f533054ff4ef32631f755f",
"assets/assets/images/skills/gif/wood_skill_5.gif": "412d95be67d0505f4619bd0518a7b7b7",
"assets/assets/images/skills/gif/water_skill_2.gif": "8452f315decb39aa0bb8476e3c5dced9",
"assets/assets/images/skills/gif/lightning_skill_4.gif": "79cc063124cf9af459606dbdb558fa46",
"assets/assets/images/skills/gif/wood_skill_1.gif": "1a833f952f7acbc310385c68993226a2",
"assets/assets/images/skills/gif/fire_skill_1.gif": "7917a89dc37c33928dea294da957e315",
"assets/assets/images/skills/gif/lightning_skill_1.gif": "2c55b07fcca43942517357a080d7fc89",
"assets/assets/images/skills/gif/lightning_skill_3.gif": "72d21a792b5b456b19151a5d7674379f",
"assets/assets/images/skills/gif/water_skill_5.gif": "5d6c43fce55ff20ba33f96123827e723",
"assets/assets/images/skills/gif/wood_skill_2.gif": "7329008da806939d35da6e0b66e864ef",
"assets/assets/images/skills/gif/fire_skill_3.gif": "7f40d4c4fbfb853e61df295d71879054",
"assets/assets/images/skills/gif/fire_skill_2.gif": "f0628fc1a5e5424805bad23d148e12cc",
"assets/assets/images/skills/gif/wood_skill_3.gif": "de4c82dc7db6dc4bf4607d42142b255a",
"assets/assets/images/skills/gif/water_skill_4.gif": "94cac8459e39462ecc36ebd6cf7b3971",
"assets/assets/images/skills/gif/lightning_skill_2.gif": "73ed169d074a933d8885ac5562f4dfaf",
"assets/assets/images/skills/gif/wind_skill_3.gif": "d8cdbc8085ff220c9842205cd17df27e",
"assets/assets/images/skills/gif/wind_skill_2.gif": "a1a1cb88d9bfc22382f405db9794be7a",
"assets/assets/images/skills/gif/wind_skill_1.gif": "8fc7e22d7b06cc90a9c6c71fc8f43a3e",
"assets/assets/images/skills/gif/wind_skill_5.gif": "f00bbc1a55be5d8ef3ad1aae019d062e",
"assets/assets/images/skills/gif/wind_skill_4.gif": "5d7a8a80e70cf9ef5eb03656f53d8469",
"assets/assets/images/skills/wood_skill_3.png": "15afc2d7a737ea460e9312921416bc04",
"assets/assets/images/skills/lightning_skill_2.png": "6f4871716ed74e51b4dc7feabb56452a",
"assets/assets/audio/tiles/gold.mp3": "d04b85435ba003582402f57cc2508808",
"assets/assets/audio/tiles/exp.mp3": "6ed700114f9301a3ea92fcd96a3ed90e",
"assets/assets/audio/tiles/advanced_sword.mp3": "b1ab4797ece75accb36525a09da84e85",
"assets/assets/audio/tiles/special_sword.mp3": "d39c96065437b7fb78cba241897aad1d",
"assets/assets/audio/tiles/hp.mp3": "bafb45e530493009d8288776314210b2",
"assets/assets/audio/tiles/clock.mp3": "3bc7a9f5ed16cd3cce55df958f18661f",
"assets/assets/audio/tiles/energy.mp3": "8cd6cf2e274b6abcd20dd6e94342e75b",
"assets/assets/audio/tiles/special_sword.wav": "94020a9856af8692653fe10b3ec20968",
"assets/assets/audio/tiles/basic_sword.mp3": "b1ab4797ece75accb36525a09da84e85",
"assets/assets/audio/bgm/home_theme.mp3": "0b8fccbf95ec1ad70e3427d84638128c",
"assets/assets/audio/bgm/battle_theme.mp3": "7493e0d2eba6a9deae441634e7dd8b64",
"assets/assets/audio/skills/fire_skill_5.mp3": "27eb1a79b33b7c6d76ee48ec25ed85a3",
"assets/assets/audio/skills/lightning_skill_5.mp3": "8b08c7d4c65f89cf6e123dae2ebc2d4c",
"assets/assets/audio/skills/wood_skill_4.mp3": "12c71c127ddc7b072d880e4627655cca",
"assets/assets/audio/skills/water_skill_3.mp3": "ccdbb5717ca18b5a60aa905ddc68facf",
"assets/assets/audio/skills/water_skill_2.mp3": "12c71c127ddc7b072d880e4627655cca",
"assets/assets/audio/skills/wood_skill_5.mp3": "e97a0aa8d6ad4dcba85304945b42a1f3",
"assets/assets/audio/skills/lightning_skill_4.mp3": "ccc53e142a03ed323542825b36fecc1f",
"assets/assets/audio/skills/fire_skill_4.mp3": "60567898885d3f1287f4c2b5689b34a5",
"assets/assets/audio/skills/water_skill_1.mp3": "cc508306d1323a09e75d6eaa9aae9793",
"assets/assets/audio/skills/fire_skill_3.mp3": "51e34fd3f3bfc03ec21957d1dced5505",
"assets/assets/audio/skills/lightning_skill_3.mp3": "a89e147b3ef68f315839b436833a69bd",
"assets/assets/audio/skills/wood_skill_2.mp3": "7207863d2b389c0d121a9a11d70a01c1",
"assets/assets/audio/skills/water_skill_5.mp3": "a9d77ce44902138ef71172faa20f7939",
"assets/assets/audio/skills/water_skill_4.mp3": "1094e9c59c8aa62ba6e97e9c3acfb4e3",
"assets/assets/audio/skills/wood_skill_3.mp3": "6ad95d35189dd98c383a24dd943e2e15",
"assets/assets/audio/skills/lightning_skill_2.mp3": "920ff2fbe71c1cf5a0b5f91f2e7abf9c",
"assets/assets/audio/skills/fire_skill_2.mp3": "6546f47ab5a943ad522c16573a86c816",
"assets/assets/audio/skills/wood_skill_1.mp3": "cedef0f0ba31654e2da3edd68cae677a",
"assets/assets/audio/skills/lightning_skill_1.mp3": "6e859100f73c5ac0a521e20e254cbf71",
"assets/assets/audio/skills/fire_skill_1.mp3": "21b42026efad5d8d1568f494f239849d",
"assets/assets/audio/skills/earth_skill_4.mp3": "b0cb4a82c7c6c6721c5cd3229597ac8d",
"assets/assets/audio/skills/earth_skill_5.mp3": "ac13ade6a4bf45f09166139987b29ffe",
"assets/assets/audio/skills/earth_skill_1.mp3": "4a0fe81c239a9f86446344e382c7b166",
"assets/assets/audio/skills/earth_skill_2.mp3": "473aeebe5e46e2964e30486ef8bcae3a",
"assets/assets/audio/skills/earth_skill_3.mp3": "2a3d68fa0f8cc19581935aa7892eae8b",
"assets/assets/audio/skills/wind_skill_1.mp3": "20c7d7dfbf794185e0e283fb8ad5c642",
"assets/assets/audio/skills/wind_skill_3.mp3": "6acbffad89f05eca1388c6e0061aff12",
"assets/assets/audio/skills/wind_skill_2.mp3": "32db0d1f98f8205d76254f2420eb703b",
"assets/assets/audio/skills/wind_skill_5.mp3": "1da2c4b60483638348f182489025bfad",
"assets/assets/audio/skills/wind_skill_4.mp3": "69a55854bdfa499f9ee4dac5ef9d41c9",
"assets/assets/audio/events/heaven_tribulation.wav": "8cc1971812b3acae40cd90159934791b",
"assets/assets/audio/events/heaven_tribulation.mp3": "4902e3c8239cf2dd613943961d03924c",
"assets/assets/audio/challenge_bgm/challenge_theme_3.mp3": "5c3c06d371c320e2b64eff7d9668c72a",
"assets/assets/audio/challenge_bgm/challenge_theme_2.mp3": "924468ccb9ce0f594ae5f856d13d3ea4",
"assets/assets/audio/challenge_bgm/challenge_theme_1.mp3": "7493e0d2eba6a9deae441634e7dd8b64",
"assets/assets/audio/challenge_bgm/challenge_theme_5.mp3": "e72879f99fae9b630b7898eafec17492",
"assets/assets/audio/challenge_bgm/challenge_theme_10.mp3": "acc7a0f292d04c8cbc4863ccecbb5c8c",
"assets/assets/audio/challenge_bgm/challenge_theme_4.mp3": "3c486a15c5e725aa20f48a56265f973b",
"assets/assets/audio/challenge_bgm/challenge_theme_6.mp3": "91ebe95913df839f3d80676a8e4a8def",
"assets/assets/audio/challenge_bgm/challenge_theme_7.mp3": "ec4119f6f5f852012358b76daeee6b19",
"assets/assets/audio/challenge_bgm/challenge_theme_9.mp3": "8a5860c6ee40e0cbc984f74cabb7e91a",
"assets/assets/audio/challenge_bgm/challenge_theme_8.mp3": "98192210c623df52c46e67aa18cc6cde",
"canvaskit/skwasm.js": "8060d46e9a4901ca9991edd3a26be4f0",
"canvaskit/skwasm_heavy.js": "740d43a6b8240ef9e23eed8c48840da4",
"canvaskit/skwasm.js.symbols": "3a4aadf4e8141f284bd524976b1d6bdc",
"canvaskit/canvaskit.js.symbols": "a3c9f77715b642d0437d9c275caba91e",
"canvaskit/skwasm_heavy.js.symbols": "0755b4fb399918388d71b59ad390b055",
"canvaskit/skwasm.wasm": "7e5f3afdd3b0747a1fd4517cea239898",
"canvaskit/chromium/canvaskit.js.symbols": "e2d09f0e434bc118bf67dae526737d07",
"canvaskit/chromium/canvaskit.js": "a80c765aaa8af8645c9fb1aae53f9abf",
"canvaskit/chromium/canvaskit.wasm": "a726e3f75a84fcdf495a15817c63a35d",
"canvaskit/canvaskit.js": "8331fe38e66b3a898c4f37648aaf7ee2",
"canvaskit/canvaskit.wasm": "9b6a7830bf26959b200594729d73538e",
"canvaskit/skwasm_heavy.wasm": "b0be7910760d205ea4e011458df6ee01"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
