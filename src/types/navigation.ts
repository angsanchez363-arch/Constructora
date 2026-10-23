import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type ObrasStackParamList = {
  ObrasList: undefined;
  ObraDetail: { obraId: string };
};

export type MaterialesStackParamList = {
  MaterialesList: undefined;
  MaterialDetail: { materialId: string };
  MaterialForm: undefined;
};

export type RootTabParamList = {
  InicioTab: undefined;
  ObrasTab: NavigatorScreenParams<ObrasStackParamList>;
  MaterialesTab: NavigatorScreenParams<MaterialesStackParamList>;
  ContactoTab: undefined;
};

export type RootTabScreenProps<T extends keyof RootTabParamList> = BottomTabScreenProps<RootTabParamList, T>;

export type ObrasStackScreenProps<T extends keyof ObrasStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ObrasStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

export type MaterialesStackScreenProps<T extends keyof MaterialesStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<MaterialesStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;
