const fs = require('fs');
let c=fs.readFileSync('src/pages/Auth/LoginPage.tsx','utf8');
c = c.replace(/<\/Button>[\s\S]*?<\/Form\.Item>/, \</Button>
            <div className="mt-4 text-center mt-3 flex justify-center w-full" style={{marginTop: '15px'}}>
              <span>Chưa có tài khoản? </span>
              <Link to="/register" className="text-[#0f6cbf] hover:underline" style={{marginLeft: '0.5rem'}}>
                  Đăng ký
              </Link>
            </div>
            
            <div className="mt-6 border-t pt-4 text-center w-full" style={{marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '15px'}}>
                <p className="text-gray-500 mb-4 text-sm" style={{marginBottom: '10px'}}>Hoặc đăng nhập nhanh bằng:</p>
                <div className="flex justify-center" id="google-signin-btn">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                    />
                </div>
            </div>
          </Form.Item>\);
fs.writeFileSync('src/pages/Auth/LoginPage.tsx', c);
