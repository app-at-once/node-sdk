"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthAction = exports.OAuthProvider = void 0;
var OAuthProvider;
(function (OAuthProvider) {
    OAuthProvider["GOOGLE"] = "google";
    OAuthProvider["FACEBOOK"] = "facebook";
    OAuthProvider["APPLE"] = "apple";
    OAuthProvider["GITHUB"] = "github";
    OAuthProvider["MICROSOFT"] = "microsoft";
    OAuthProvider["TWITTER"] = "twitter";
})(OAuthProvider || (exports.OAuthProvider = OAuthProvider = {}));
var OAuthAction;
(function (OAuthAction) {
    OAuthAction["SIGNIN"] = "signin";
    OAuthAction["LINK"] = "link";
})(OAuthAction || (exports.OAuthAction = OAuthAction = {}));
//# sourceMappingURL=oauth.js.map