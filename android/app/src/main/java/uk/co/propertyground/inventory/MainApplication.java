package uk.co.propertyground.inventory;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.corbt.keepawake.KCKeepAwakePackage;
import org.reactnative.camera.RNCameraPackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.rnfs.RNFSPackage;
import com.reactnativerecordsound.ReactNativeRecordSoundPackager;
import com.imagepicker.ImagePickerPackage;
//import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
//import com.reactnativenavigation.NavigationReactPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.futurice.rctaudiotoolkit.AudioPackage;
import com.reactnativenavigation.NavigationApplication;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication { //Application implements ReactApplication {

/*
  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new KCKeepAwakePackage(),
            new RNCameraPackage(),
            new ReactNativeAudioPackage(),
            new OrientationPackage(),
            new RNFSPackage(),
            new ReactNativeRecordSoundPackager(),
            new ImagePickerPackage(),
            new RCTCameraPackage(),
            new PickerPackage(),
            new NavigationReactPackage()
            new AudioPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage TODO false);
    BackgroundTaskPackage.useContext(this);
  }
*/

    @Override
    public boolean isDebug() {
       // Make sure you are using BuildConfig from your own application
       return BuildConfig.DEBUG;
    }

    protected List<ReactPackage> getPackages() {
         // Add additional packages you require here
         // No need to add RnnPackage and MainReactPackage
         return Arrays.<ReactPackage>asList(
             new MainReactPackage(),
             new KCKeepAwakePackage(),
             new RNCameraPackage(),
             new ReactNativeAudioPackage(),
             new OrientationPackage(),
             new RNFSPackage(),
             new ReactNativeRecordSoundPackager(),
             new ImagePickerPackage(),
             //new RCTCameraPackage(),
             new PickerPackage(),
             //new NavigationReactPackage(),
             new AudioPackage()
         );
     }

     @Override
     public List<ReactPackage> createAdditionalReactPackages() {
         return getPackages();
     }

    //  @Override
    // public String getJSMainModuleName() {
    //     return "index.android";
    // }

    @Override
    public String getJSMainModuleName() {
        return "index";
    }

}
