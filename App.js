/**
 * Property Ground React Native App
 * https://sph.com.sg
 * @sara
 * app bootstrap using wix Navigator
 */
import { Navigation } from 'react-native-navigation';

import Login from './pages/Login';
import Inspections from './pages/Inspections';
import NewProperty from './pages/NewProperty';
import AddRoomList from './pages/AddRoomList';
import RoomList from './pages/RoomList';
import SortRoomList from './pages/SortRoomList';
import EditPropertyInfo from './pages/EditPropertyInfo';
import GeneralCondition from './pages/GeneralCondition';


Navigation.registerComponent('PropertyGround.Login', () => Login);
Navigation.registerComponent('PropertyGround.Inspections', () => Inspections);
Navigation.registerComponent('PropertyGround.NewProperty', () => NewProperty);
Navigation.registerComponent('PropertyGround.AddRoomList', () => AddRoomList);
Navigation.registerComponent('PropertyGround.RoomList', () => RoomList);
Navigation.registerComponent('PropertyGround.SortRoomList', () => SortRoomList);
Navigation.registerComponent('PropertyGround.EditPropertyInfo', () => EditPropertyInfo);
Navigation.registerComponent('PropertyGround.GeneralCondition', () => GeneralCondition);


  const navigatorStyle = {
	  navBarTextColor: 'white',
	  navBarButtonColor: 'white',
    navBarBackgroundColor: '#00BDDB',//'#1F4065',//'#00BDDB',//'#3F88DE',
    screenBackgroundColor: '#FFFFFF',

    navBarTranslucent: false,
    navBarTransparent: false,
    drawUnderNavBar: false,
    navBarBlur: false,
    navBarHidden: false,

    orientation: 'portrait',
    statusBarTextColorScheme: 'light',
    statusBarTextColorSchemeSingleScreen: 'light',
    statusBarHideWithNavBar: false,
    statusBarHidden: false,
  };

Navigation.startSingleScreenApp({
  screen: {
    screen: 'PropertyGround.Inspections',
    animated: true,
    title: 'Inspections',
    navigatorStyle
  },
  // drawer: {
	// 	left: {
	// 		screen: 'Snappar.Drawer'
	// 	},
  //   style: {
  //     drawerShadow: 'NO'
  //   },
  //   disableOpenGesture: true,
	// }
});
