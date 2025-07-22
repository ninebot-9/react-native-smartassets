import { TurboModuleRegistry, Platform } from 'react-native'
import AssetSourceResolver from 'react-native/Libraries/Image/AssetSourceResolver'
//const { Smartassets } = NativeModules
const Smartassets = TurboModuleRegistry.get('Smartassets')
let iOSRelateMainBundlePath = ''
let bundlePath = null
let _sourceCodeScriptURL
function getSourceCodeScriptURL() {
  if (_sourceCodeScriptURL) {
    return _sourceCodeScriptURL
  }
  let sourceCode = global.nativeExtensions && global.nativeExtensions.SourceCode
  if (!sourceCode) {
    sourceCode = TurboModuleRegistry && TurboModuleRegistry.get('SourceCode').getConstants()
  }
  _sourceCodeScriptURL = sourceCode.scriptURL
  return _sourceCodeScriptURL
}

function getPathBeforePackage(url, packageName = 'RNPackage') {
  // 先去掉 file:// 前缀
  let cleanUrl = url.replace(/^file:\/\//, '');
  // 找到 Documents/ 的位置
  const documentsIndex = cleanUrl.indexOf('/Documents');
  if (documentsIndex !== -1) {
    return cleanUrl.substring(0, documentsIndex + '/Documents'.length);
  }
  // 如果没有找到 Documents/，则使用原来的逻辑
  const index = cleanUrl.indexOf(`/${packageName}`);
  return index !== -1 ? cleanUrl.substring(0, index) : '';
}

const defaultMainBundePath = '' //Smartassets.DefaultMainBundlePath;
var _ = require('lodash')
var SmartAssets = {
  
  initSmartAssets() {
    var initialize = _.once(this.initSmartAssetsInner)
    initialize()
  },
  initSmartAssetsInner() {
    let drawablePathInfos = []
    let drawablePathInfosFromPlatform = []
    // 拼接bundlePath
    if (__DEV__) {
    } else if (Platform.OS === "android") {
      const codeUrl = getSourceCodeScriptURL();
      const p0 = codeUrl.split("/assets/")[0];
      bundlePath = "file://" + p0 + "/res/";
    } else if (Platform.OS === "ios") {
    }
    
    Smartassets.travelDrawable(getSourceCodeScriptURL(), (retArray) => {
      drawablePathInfos = drawablePathInfos.concat(retArray)
    })
    Smartassets.travelDrawable(getPlatformPath(), (retArray) => {
      drawablePathInfosFromPlatform =
        drawablePathInfosFromPlatform.concat(retArray)
    })
    AssetSourceResolver.prototype.defaultAsset = _.wrap(
      AssetSourceResolver.prototype.defaultAsset,
      function (func, ...args) {

        if (this.isLoadedFromServer()) {
          return this.assetServerURL()
        }
        if (Platform.OS === 'android') {
          if (this.isLoadedFromFileSystem() || bundlePath != null) {
            //begin assets ios begin drawable android
            if (bundlePath != null) {
              this.jsbundleUrl = bundlePath
            }
            let resolvedAssetSource = this.drawableFolderInBundle()
            let resPath = resolvedAssetSource.uri

            if (drawablePathInfos.includes(resPath)) {
              //已经在bundle目录中有
              return resolvedAssetSource
            }

            let isFileExist = Smartassets.isFileExist(resPath)
            if (isFileExist === true) {
              return resolvedAssetSource
            } else {
              // 基础包资源里再找一次
              const lastPath = resPath.split('/res/')[1]
              if (lastPath) {
                const fullPath = drawablePathInfosFromPlatform.find((p) =>
                  p.endsWith(lastPath)
                )
                if (fullPath) {
                  return {
                    ...resolvedAssetSource,
                    uri: fullPath
                  }
                }
              }
              return this.resourceIdentifierWithoutScale()
            }
          } else {
            return this.resourceIdentifierWithoutScale()
          }
        } else  {
          if (bundlePath != null) {
            this.jsbundleUrl = bundlePath
          }
          let iOSAsset = this.scaledAssetURLNearBundle()
          let isFileExist = Smartassets.isFileExist(iOSAsset.uri)
          if (isFileExist) {
            return iOSAsset
          } else {
            // let oriJsBundleUrl = 'file://'+defaultMainBundePath+'/'+iOSRelateMainBundlePath;
            iOSAsset.uri = iOSAsset.uri.replace(
              this.jsbundleUrl,
              iOSRelateMainBundlePath
            )
            return iOSAsset
          }
        }
      }
    )
  },

  setAssetsBundlePath(rn_module,folderName,platformName){
    if(Platform.OS == 'ios') {
      const codeUrl = getSourceCodeScriptURL();
      const pathPrefix = getPathBeforePackage(codeUrl);
      bundlePath = pathPrefix + '/'+ folderName +'/'+ rn_module + '/';
      iOSRelateMainBundlePath = pathPrefix + '/'+ folderName + '/' + platformName + '/';
    }
  },
  setBundlePath(bundlePathNew) {
    if (!bundlePath) {
      bundlePath = bundlePathNew
    }
  },
  setiOSRelateMainBundlePath(relatePath) {
    if (!iOSRelateMainBundlePath) {
      iOSRelateMainBundlePath = relatePath
    }
  }
}

const platform = 'platform'

function getPlatformPath() {
  const codeUrl = getSourceCodeScriptURL()
  if (Platform.OS === 'android') {
    const p0 = codeUrl.split('/assets/')[0]
    return (
      p0.slice(0, p0.lastIndexOf('/')) +
      '/' +
      platform +
      '/assets/' +
      platform +
      '.bundle'
    )
  }
  return codeUrl
}

export { SmartAssets }
