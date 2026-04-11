const fs = require('fs'); let c=fs.readFileSync('src/pages/Auth/LoginPage.tsx','utf8'); const start = c.indexOf('<Button type=\\'primary\\' htmlType=\\'submit\\' className=\\'w-full bg-[#0f6cbf]\\'>'); if (start > -1) { const end = c.indexOf('</Button>', start) + 9; const replace = '<Button type=\
primary\ htmlType=\submit\ className=\w-full
bg-[#0f6cbf]\>\\n              ??ng nh?p\\n            </Button>\\n            <div className=\mt-4
text-center
mt-3
flex
justify-center
w-full\ style={{marginTop: \\'15px\\'}}>\\n              <span>Ch?a c? t?i kho?n? </span>\\n              <Link to=\/register\ className=\text-[#0f6cbf]
hover:underline\ style={{marginLeft: \\'0.5rem\\'}}>\\n                  ??ng k?\\n              </Link>\\n            </div>\\n            \\n            <div className=\mt-6
border-t
pt-4
text-center
w-full\ style={{marginTop: \\'20px\\', borderTop: \\'1px solid #ddd\\', paddingTop: \\'15px\\'}}>\\n                <p className=\text-gray-500
mb-4
text-sm\ style={{marginBottom: \\'10px\\'}}>Ho?c ??ng nh?p nhanh b?ng:</p>\\n                <div className=\flex
justify-center\ id=\google-signin-btn\>\\n                    <GoogleLogin\\n                        onSuccess={handleGoogleSuccess}\\n                        onError={handleGoogleFailure}\\n                    />\\n                </div>\\n            </div>'; c = c.substring(0, start) + replace + c.substring(end); fs.writeFileSync('src/pages/Auth/LoginPage.tsx', c); console.log('Fixed'); }
