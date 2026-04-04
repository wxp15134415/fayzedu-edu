object Form1: TForm1
  Left = 424
  Top = 293
  Width = 1305
  Height = 781
  Caption = #31119#23433#19968#20013#20934#32771#35777#32534#25490#36719#20214
  Color = clBtnFace
  Font.Charset = ANSI_CHARSET
  Font.Color = clWindowText
  Font.Height = -16
  Font.Name = #24494#36719#38597#40657
  Font.Style = []
  OldCreateOrder = False
  WindowState = wsMaximized
  OnClose = FormClose
  OnShow = FormShow
  PixelsPerInch = 96
  TextHeight = 21
  object pnl1: TPanel
    Left = 0
    Top = 0
    Width = 1289
    Height = 241
    Align = alTop
    TabOrder = 0
    object lbl1: TLabel
      Left = 32
      Top = 64
      Width = 144
      Height = 21
      Caption = #36755#20837#23398#21495#25110#22995#21517#26597#35810
    end
    object edt1: TEdit
      Left = 32
      Top = 147
      Width = 153
      Height = 29
      TabOrder = 6
      Text = '20199108'
    end
    object cbb1: TComboBox
      Left = 32
      Top = 24
      Width = 73
      Height = 29
      Style = csDropDownList
      ItemHeight = 21
      ItemIndex = 1
      TabOrder = 0
      Text = #39640#19968
      OnChange = cbb1Change
      Items.Strings = (
        ''
        #39640#19968
        #39640#20108
        #39640#19977
        ''
        ''
        ''
        #21021#19968
        #21021#20108
        #21021#19977)
    end
    object btn1: TButton
      Left = 192
      Top = 88
      Width = 153
      Height = 25
      Caption = #26597#35810#23398#29983#22522#26412#20449#24687
      TabOrder = 1
      OnClick = btn1Click
    end
    object cbb2: TComboBox
      Left = 128
      Top = 24
      Width = 65
      Height = 29
      ItemHeight = 21
      ItemIndex = 2
      TabOrder = 2
      Text = '2019'
      OnChange = cbb2Change
      Items.Strings = (
        '2017'
        '2018'
        '2019'
        '2020'
        '2021'
        '2022'
        '2023'
        '2024'
        '2025'
        '2026'
        '2027'
        '2028'
        '2029'
        '2030')
    end
    object btn2: TButton
      Left = 32
      Top = 120
      Width = 153
      Height = 25
      Caption = #32771#22330#20449#24687#35774#32622
      TabOrder = 3
      OnClick = btn2Click
    end
    object btn3: TButton
      Left = 192
      Top = 120
      Width = 153
      Height = 25
      Caption = #26356#26032#31185#30446#20154#25968
      TabOrder = 4
      OnClick = btn3Click
    end
    object btn4: TButton
      Left = 32
      Top = 176
      Width = 153
      Height = 25
      Caption = #24320#22987#32534#25490#32771#22330
      TabOrder = 5
      OnClick = btn4Click
    end
    object btn5: TButton
      Left = 32
      Top = 88
      Width = 153
      Height = 25
      Caption = #23548#20837#23398#29983#22522#26412#20449#24687
      TabOrder = 7
      OnClick = btn5Click
    end
    object edt2: TEdit
      Left = 192
      Top = 56
      Width = 153
      Height = 29
      TabOrder = 8
    end
    object btn6: TButton
      Left = 32
      Top = 208
      Width = 153
      Height = 25
      Caption = #26597#30475#32771#22330#32534#25490
      TabOrder = 9
      OnClick = btn6Click
    end
    object btn7: TButton
      Left = 192
      Top = 208
      Width = 153
      Height = 25
      Caption = #23548#20986#22909#20998#25968#34920#26684
      TabOrder = 10
      OnClick = btn7Click
    end
    object btn8: TButton
      Left = 360
      Top = 85
      Width = 153
      Height = 25
      Caption = #23548#20837#32771#35797#22320#28857
      TabOrder = 11
      OnClick = btn8Click
    end
    object btn9: TButton
      Left = 360
      Top = 120
      Width = 153
      Height = 25
      Caption = #26597#30475#32771#35797#22320#28857
      TabOrder = 12
      OnClick = btn9Click
    end
    object btn10: TButton
      Left = 192
      Top = 176
      Width = 153
      Height = 25
      Caption = #23548#20986#20934#32771#35777
      TabOrder = 13
      OnClick = btn10Click
    end
    object btn11: TButton
      Left = 360
      Top = 148
      Width = 153
      Height = 25
      Caption = #26356#26032#32771#35797#22320#28857
      TabOrder = 14
      OnClick = btn11Click
    end
    object btn12: TButton
      Left = 360
      Top = 176
      Width = 153
      Height = 25
      Caption = #23548#20986#32771#29983#20449#24687#34920
      TabOrder = 15
      OnClick = btn12Click
    end
    object btn13: TButton
      Left = 192
      Top = 148
      Width = 153
      Height = 25
      Caption = #26356#26032#20934#32771#21495
      TabOrder = 16
      OnClick = btn13Click
    end
    object btn14: TButton
      Left = 360
      Top = 208
      Width = 153
      Height = 25
      Caption = #23548#20986#31614#21040#34920
      TabOrder = 17
      OnClick = btn14Click
    end
    object btn15: TButton
      Left = 200
      Top = 24
      Width = 145
      Height = 25
      Caption = #26356#26032#26376#32771#25104#32489
      TabOrder = 18
      OnClick = btn15Click
    end
    object rg1: TRadioGroup
      Left = 520
      Top = 128
      Width = 345
      Height = 105
      Caption = #20934#32771#21495#35268#21017
      Font.Charset = ANSI_CHARSET
      Font.Color = clWindowText
      Font.Height = -12
      Font.Name = #24494#36719#38597#40657
      Font.Style = []
      ItemIndex = 1
      Items.Strings = (
        #24180#32423#20195#21495'+'#29677#32423'+'#24231#21495'+'#32771#22330'+'#24231#20301#21495'('#26657#20869'9'#20301')'
        #24180#32423#20195#21495'+'#31185#30446#20195#21495'+'#29677#32423'+'#24231#21495'+'#32771#22330'+'#24231#20301#21495'('#26657#20869'10'#20301')'
        #23398#26657#20195#21495'+'#24180#32423#20195#21495'+'#31185#30446#20195#21495'+'#32771#22330'+'#24231#20301#21495'('#23425#24503'10'#20301')'
        #22266#23450#32771#21495)
      ParentFont = False
      TabOrder = 19
    end
    object mmo1: TMemo
      Left = 872
      Top = 136
      Width = 185
      Height = 97
      Lines.Strings = (
        'mmo1')
      TabOrder = 20
    end
    object chk1: TCheckBox
      Left = 368
      Top = 32
      Width = 113
      Height = 17
      Caption = #38656#23433#25490#23398#32771
      TabOrder = 21
    end
    object btn16: TButton
      Left = 520
      Top = 88
      Width = 153
      Height = 25
      Caption = #23548#20986#26465#24418#30721
      TabOrder = 22
      OnClick = btn16Click
    end
  end
  object pnl2: TPanel
    Left = 0
    Top = 241
    Width = 1289
    Height = 484
    Align = alClient
    Caption = 'pnl2'
    TabOrder = 1
    object DBGrid1: TDBGrid
      Left = 1
      Top = 26
      Width = 1287
      Height = 457
      Align = alClient
      DataSource = ds1
      TabOrder = 0
      TitleFont.Charset = ANSI_CHARSET
      TitleFont.Color = clWindowText
      TitleFont.Height = -16
      TitleFont.Name = #24494#36719#38597#40657
      TitleFont.Style = []
    end
    object dbnvgr1: TDBNavigator
      Left = 1
      Top = 1
      Width = 1287
      Height = 25
      DataSource = ds1
      Align = alTop
      TabOrder = 1
    end
  end
  object pnl3: TPanel
    Left = 0
    Top = 241
    Width = 1289
    Height = 484
    Align = alClient
    Caption = 'pnl3'
    TabOrder = 2
    object DBGrid2: TDBGrid
      Left = 1
      Top = 26
      Width = 1287
      Height = 457
      Align = alClient
      DataSource = ds1
      TabOrder = 0
      TitleFont.Charset = ANSI_CHARSET
      TitleFont.Color = clWindowText
      TitleFont.Height = -16
      TitleFont.Name = #24494#36719#38597#40657
      TitleFont.Style = []
    end
    object dbnvgr2: TDBNavigator
      Left = 1
      Top = 1
      Width = 1287
      Height = 25
      DataSource = ds1
      Align = alTop
      TabOrder = 1
    end
  end
  object pb1: TProgressBar
    Left = 0
    Top = 725
    Width = 1289
    Height = 17
    Align = alBottom
    TabOrder = 3
  end
  object con1: TADOConnection
    ConnectionString = 
      'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=D:\'#21516#27493#30424'\'#25945#21153#22788#24037#20316'\'#20934#32771#35777#32534#25490'\' +
      'data\'#20934#32771#35777'.mdb;Persist Security Info=False'
    KeepConnection = False
    LoginPrompt = False
    Provider = 'Microsoft.Jet.OLEDB.4.0'
    Left = 504
    Top = 312
  end
  object ds1: TDataSource
    DataSet = qry1
    Left = 456
    Top = 312
  end
  object qry1: TADOQuery
    Connection = con1
    Parameters = <>
    Left = 456
    Top = 368
  end
  object qry2: TADOQuery
    Connection = con1
    Parameters = <>
    Left = 568
    Top = 369
  end
  object dlgOpen1: TOpenDialog
    Left = 616
    Top = 304
  end
end
