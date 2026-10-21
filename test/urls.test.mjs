import {test} from 'node:test';
import assert from 'node:assert/strict';
import {safeUrl} from '../pod-core.mjs';
test('allows HTTPS provider/resource/WebID URLs and local development',()=>{assert.equal(safeUrl('https://example.com/profile#me'),'https://example.com/profile#me');assert.equal(safeUrl('http://localhost:8771/parent/'),'http://localhost:8771/parent/')});
test('rejects credential-bearing, non-web and non-loopback insecure URLs',()=>{for(const value of ['javascript:alert(1)','file:///private','data:text/html,hi','https://user:password@example.com/','http://example.com/','not a URL'])assert.throws(()=>safeUrl(value))});
