## 2.0.0
- BREAKING: Changed version management logic. Now using production, uat, beta, test.
- removed the *--max-old-space-size=4096* automatic flag on node process. If you want to use it, set it in the *onit.config.js* file, as *nodeArgs = ['--max-old-space-size=4096']* in the *serve* section

